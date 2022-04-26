package main

import (
	"context"
	"encoding/base64"
	"errors"
	"fmt"
	"log"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"

	"update-deployment/update-deployment/schema/aws/ecr/ecrimagescan"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/eks"
	ekssvctypes "github.com/aws/aws-sdk-go-v2/service/eks/types"
	"github.com/aws/aws-sdk-go-v2/service/eventbridge"
	ebsvctypes "github.com/aws/aws-sdk-go-v2/service/eventbridge/types"
	"golang.org/x/exp/slices"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	appsv1 "k8s.io/client-go/kubernetes/typed/apps/v1"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/util/retry"
	"sigs.k8s.io/aws-iam-authenticator/pkg/token"
)

type Response struct {
	Message    string `json:"message"`
	Deployment string `json:"deployment"`
	Namespace  string `json:"namespace"`
	Cluster    string `json:"cluster"`
	StatusCode int    `json:"statusCode"`
	Error      string `json:"error,omitempty"`
}

// These 2 consts set the deployment check interval and the timeout for waiting for a deployment to successfully roll out
const (
	deployRunningThreshold     = time.Second * 120
	deployRunningCheckInterval = time.Second * 3
)

// As this is only consumed by a lambda main just calls the lamba start function
func main() {

	lambda.Start(handler)
}

func handler(context context.Context, event ecrimagescan.AWSEvent) (Response, error) {

	// generate variables from environment variables, setting defaults if unset
	mainBranchName := getenvvar("BRANCH_NAME", "main")
	// in case the tag we need to check isn't just the main branch name it can be set here
	tagToCheck := getenvvar("LATEST_TAG", mainBranchName)
	clustername := getenvvar("EKS_CLUSTER_NAME", "kidskube-uk-kidskube-loadtest-eks")
	namespaceName := getenvvar("APPS_NAMESPACE", "kl-apps")
	deploymentName := getenvvar("DEPLOYMENT_NAME", "kidsloop-user-service")
	eventBusName := getenvvar("EVENTBUS_NAME", "loadtest-poc-event-bus")
	eventSourceName := getenvvar("EVENT_OUTPUT_SOURCE", "live.kidsloop.kidskube-loadtest.user-updated")
	emitEvent, err := strconv.ParseBool(getenvvar("EMIT_EVENT", "true"))
	assumeRoleArn := getenvvar("EKS_ASSUME_ROLE", "arn:aws:iam::828974637366:role/UpdateDeploymentEKSAssumeRole")

	//to handle the tags from this repo we overwrite the branch name to an empty string to check just for a commit hash
	if event.Detail.RepositoryName == "kidsloop-h5p-service" {
		mainBranchName = ""
	}

	if err != nil {
		log.Fatalf("error parsing environment variables, %v", err)
	}

	//initalise a response instance
	response := Response{
		Deployment: deploymentName,
		Namespace:  namespaceName,
		Cluster:    clustername,
	}

	// Filter just tags from the invoming event
	incomingTags := event.Detail.ImageTags

	// If the new image is not from the main branch we don't want to deploy it
	if !(slices.Contains(incomingTags, tagToCheck)) {
		response.Message = "Image is from a different branch or repository"
		response.StatusCode = 0
		return response, nil
	}

	// Filter for the first full image tag
	newTag, err := filterTags(incomingTags, mainBranchName)

	if err != nil {
		response.Message = "Failed to filter image tags"
		response.StatusCode = 1
		response.Error = err.Error()
		return response, err
	}
	log.Printf("updating %v deployment to %v", deploymentName, newTag)

	// Load the AWS Client config
	cfg, err := config.LoadDefaultConfig(context)

	if err != nil {
		response.Message = "unable to load AWS SDK configuration"
		response.StatusCode = 1
		response.Error = err.Error()
		return response, err
	}

	// Load an EKS Service Client
	svc := eks.NewFromConfig(cfg)

	// load the EKS Cluster we want to update our deployment in
	data := &eks.DescribeClusterInput{
		Name: aws.String(clustername),
	}

	// In order to ensure the client works and we have the data needed for our k8s client we call describe cluster
	cluster, err := svc.DescribeCluster(context, data)

	if err != nil {
		response.Message = "Error calling DescribeCluster"
		response.StatusCode = 1
		response.Error = err.Error()
		return response, err
	}

	// Load a kubernetes client
	client, err := getK8sClient(cluster.Cluster, assumeRoleArn)

	if err != nil {
		response.Message = "Error creating k8s client"
		response.StatusCode = 1
		response.Error = err.Error()
		return response, err
	}

	// initalise a deployment client in our namespace
	deploymentsClient := client.AppsV1().Deployments(namespaceName)

	// Check we can access the deployment we want to update and load data we can process
	deployment, err := deploymentsClient.Get(context, deploymentName, metav1.GetOptions{})

	if err != nil {
		response.Message = "Failed to access deployment"
		response.StatusCode = 1
		response.Error = err.Error()
		return response, err
	}

	// grab current image from Deployment spec
	currentImage := deployment.Spec.Template.Spec.Containers[0].Image

	// Split the current image up based on repo and tag
	tagBreak := strings.Index(currentImage, ":")
	imageRepository := currentImage[0:tagBreak]
	currentTag := currentImage[tagBreak+1:]

	// No need to adjust the Deployment if the version is the same
	if currentTag == newTag {
		response.Message = fmt.Sprintf("Not updating as incoming tag matches existing deployment: %v", currentTag)
		response.StatusCode = 0
		return response, nil
	}

	// Join the image name with repo and tag - in order to apply to the deployment
	newImage := imageRepository + ":" + newTag

	// Cycle a retry on updating the deployment - this allows a retry if other aspects of the deployment were changed
	err = retry.RetryOnConflict(retry.DefaultRetry, func() error {

		deployment.Spec.Template.Spec.Containers[0].Image = newImage
		_, updateErr := deploymentsClient.Update(context, deployment, metav1.UpdateOptions{})

		return updateErr
	})

	if err != nil {
		response.Message = "Error updating deployment image"
		response.StatusCode = 1
		response.Error = err.Error()
		return response, err
	}

	// Wait for the deployment to be updated fully
	err = waitForDeploymentUpdate(context, deploymentsClient, deploymentName)

	if err != nil {
		response.Message = "Error waiting for deployment to update"
		response.StatusCode = 1
		response.Error = err.Error()
		return response, err
	}

	log.Print("Successfully updated deployment")

	if emitEvent {
		// Create an EventBridge client
		ebClient := eventbridge.NewFromConfig(cfg)

		// Initialise an event variable and populate it with required details
		var eventInput ebsvctypes.PutEventsRequestEntry

		eventInput.Source = aws.String(eventSourceName)
		eventInput.EventBusName = &eventBusName
		eventInput.DetailType = aws.String("UpdateSuccessful")
		eventInput.Detail = aws.String(fmt.Sprintf("{\"image\" : \"%v\"}", newImage))

		var putEventsInput eventbridge.PutEventsInput

		putEventsInput.Entries = append(putEventsInput.Entries, eventInput)

		// Put the EventBridge event on the event bus
		_, err = ebClient.PutEvents(context, &putEventsInput)

		if err != nil {
			response.Message = "Error putting success event"
			response.StatusCode = 1
			response.Error = err.Error()
			return response, err
		}
	}

	response.StatusCode = 0
	response.Message = "Succesfully updated deployment"

	// Return success
	return response, nil
}

// This function when called will check if a deployment is updated every x seconds and fail if the timeout is reached.
func waitForDeploymentUpdate(context context.Context, client appsv1.DeploymentInterface, deploymentName string) error {

	end := time.Now().Add(deployRunningThreshold)

	for {
		<-time.NewTimer(deployRunningCheckInterval).C

		var err error
		log.Print("Checking if deployment is updated")
		running, err := deploymentUpdated(context, client, deploymentName)

		if running {
			return nil
		}

		if err != nil {
			return fmt.Errorf("error while waiting for deployment updated: %v", err)
		}

		if time.Now().After(end) {
			return fmt.Errorf("deployment failed to update in time")
		}
	}
}

// This function checks if the status of a deployment is all aligned with the target replica count and returns true if it is
// it is consumed in the function above in a loop to check if the deployment is updated
func deploymentUpdated(context context.Context, client appsv1.DeploymentInterface, deploymentName string) (bool, error) {

	status, err := client.Get(context, deploymentName, metav1.GetOptions{})

	if err != nil {
		return false, err
	}

	if !(*status.Spec.Replicas == status.Status.UpdatedReplicas && *status.Spec.Replicas == status.Status.ReadyReplicas && *status.Spec.Replicas == status.Status.Replicas) {
		return false, nil
	}

	return true, nil
}

// This function is used to filter the tags for a tag like main-{$commitHash}
func filterTags(stringsSet []string, branchName string) (string, error) {

	pattern := fmt.Sprintf("%v-([a-z0-9]{7})", branchName)

	if branchName == "" {
		pattern = "([a-z0-9]{7})"
	}

	for _, s := range stringsSet {

		match, err := regexp.MatchString(pattern, s)

		if err != nil {
			return "", err
		}

		if match {
			return s, nil
		}
	}

	return "", errors.New("failed to find matching tag")
}

// This function allow us to set defaults for environment variables if they are not set.
func getenvvar(key, fallback string) string {
	value := os.Getenv(key)
	if len(value) == 0 {
		return fallback
	}
	return value
}

// This function takes an eks Cluster from the AWS Client and returns a kubernetes Client
func getK8sClient(cluster *ekssvctypes.Cluster, roleArn string) (*kubernetes.Clientset, error) {

	// initalise new token generator (from aws-iam-authenticator)
	generator, err := token.NewGenerator(true, true)

	if err != nil {
		return nil, err
	}

	// Create a token from the EKS Cluster name
	data := &token.GetTokenOptions{
		ClusterID:     *cluster.Name,
		AssumeRoleARN: roleArn,
	}

	token, err := generator.GetWithOptions(data)

	if err != nil {
		return nil, err
	}

	// decode the certificate authority for the API Server
	ca, err := base64.StdEncoding.DecodeString(*cluster.CertificateAuthority.Data)

	if err != nil {
		return nil, err
	}

	// initalise the kubernetes client
	client, err := kubernetes.NewForConfig(
		&rest.Config{
			Host:        *cluster.Endpoint,
			BearerToken: token.Token,
			TLSClientConfig: rest.TLSClientConfig{
				CAData: ca,
			},
		},
	)

	if err != nil {
		return nil, err
	}

	// Return the kubernetes client
	return client, nil
}
