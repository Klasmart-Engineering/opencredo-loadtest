export const ME = `query me {
  me {
    avatar
    email
    phone
    user_id
    username
    given_name
    family_name
  }
}`;

export const MEMBERSHIPS = `query memberships {
  me {
    memberships {
      organization_id
      roles {
        permissions {
          permission_id
          __typename
        }
        __typename
      }
      __typename
    }
    __typename
  }
}`;

export const ORG_MEMBERSHIPS = `query orgMemberships {
  me {
    email
    memberships {
      organization_id
      user_id
      status
      organization {
        organization_id
        organization_name
        phone
        owner {
          email
          __typename
        }
        status
        branding {
          iconImageURL
          primaryColor
          __typename
        }
        __typename
      }
      roles {
        role_id
        role_name
        status
        __typename
      }
      __typename
    }
    __typename
  }
}`;

export const MY_USER = `query myUser {
  myUser {
    node {
      id
      familyName
      givenName
      avatar
      contactInfo {
        email
        phone
        __typename
      }
      __typename
    }
    __typename
  }
}`;

export const MY_USERS = `query myUsers{
  my_users {
      user_id
      full_name
      given_name
      family_name
      email
      phone
      date_of_birth
      avatar
      username
  }
}`;

export const GET_USER_NODE = `query userNode($id: ID!, $organizationId: UUID!) {
  userNode(id: $id) {
    id
    givenName
    familyName
    gender
    dateOfBirth
    roles {
      id
      name
      organizationId
      schoolId
      status
      __typename
    }
    contactInfo {
      email
      phone
      __typename
    }
    organizationMembershipsConnection(
      count: 1
      filter: {organizationId: {value: $organizationId, operator: eq}}
    ) {
      edges {
        node {
          userId
          shortCode
          __typename
        }
        __typename
      }
      __typename
    }
    __typename
  }
}`;

export const GET_PERMS = `query permissions {
  me {
    memberships {
      organization_id
      roles {
        permissions {
          permission_id
          __typename
        }
        __typename
      }
      __typename
    }
    __typename
  }
}`;

export const GET_MY_CLASSES = `query myClasses {
  me {
    user_id
    full_name
    classesStudying {
      class_id
      class_name
      schools {
        school_id
        school_name
      }
      organization {
        organization_id
        organization_name
      }
    }
    classesTeaching {
      class_id
      class_name
      schools {
        school_id
        school_name
      }
      organization {
        organization_id
        organization_name
      }
    }
  }
}`;