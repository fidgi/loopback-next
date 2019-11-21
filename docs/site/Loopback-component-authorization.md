---
lang: en
title: 'Authorization'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Loopback-component-authorization.html
---

## Overview

Authorization decides if a user can perform certain action on a resource. Every
protected API endpoint needs to be restricted by specific permissions.
LoopBack's authorization package,
[@loopback/authorization](https://github.com/strongloop/loopback-next/tree/master/packages/authorization)
provides various features and provisions to check access rights of a `Principal`
on a API endpoint. The `Principal` could be a user, device, or application and
is deducted from the incoming request by the `Authentication Component`. Every
user has a set of permissions. These permissions may be associated via role
attached to the user or directly to the user.

## Design

LoopBack provides a highly extensible authorization module. It has an internal
component which depends on user provided `Authorizers` to enforce access control
policies on API endpoints.

- [Authorization Component](##Authorization-Component)

  - Authorization Interceptor

- [Configuring API Endpoints](##Configuring-API-Endpoints)

  - Authorization Decorator
  - Authorization Metadata

- [Programming Access Policies](##Programming-Access-Policies)
  - Authorizers
  - Voters
  - Authorization Providers

## Authorization Component

- The `@loopback/authorization` package exports an
  [Authorization Component class](https://github.com/strongloop/loopback-next/blob/master/packages/authorization/src/authorization-component.ts).

  - Developers will have to register this component to use access control
    features in their application.

  - The component binds an in-built interceptor (`Authorization Interceptor`) to
    all API calls.

    - The interceptor checks to see if the endpoint is annotated with an
      authorization specification.
    - It executes all classes tagged as `Authorizer` to enforce access/privilege
      control.
    - Based on the result of every `Authorizer` it decides if the current
      identity has access to the endpoint.

  - The component also declares various
    [types](https://github.com/strongloop/loopback-next/blob/master/packages/authorization/src/types.ts)
    to use in defining necessary classes and inputs by developers.

    - `Authorizer`: A class implementing access policies. Accepts
      `AuthorizationContext` and `AuthorizationMetadata` as input and returns an
      `AuthorizationDecision`.

    - `AuthorizationDecision`: expected type to be returned by an `Authorizer`

    - `AuthorizationMetadata`: expected type of the authorization spec passed to
      the decorator used to annotate a controller method. Also provided as input
      parameter to the `Authorizer`.

    - `AuthorizationContext`: contains current principal invoking an endpoint
      and expected roles and scopes.

    - `Enforcer`: type of extension classes that provide authorization services
      for an `Authorizer`.

    - `AuthorizationRequest`: type of the input provided to an `Enforcer`.

    - `AuthorizationError`: expected type of the error thrown by an `Authorizer`

## Configuring API Endpoints

Users can annotate the controller methods with access specifications using an
`authorize` decorator. The access specifications are defined as per type
[AuthorizationMetadata](https://github.com/strongloop/loopback-next/blob/master/packages/authorization/src/types.ts).

```ts
  @post('/users/{userId}/orders', {
    responses: {
      '200': {
        description: 'User.Order model instance',
        content: {'application/json': {schema: {'x-ts-type': Order}}},
      },
    },
  })
  @authenticate('jwt')
  @authorize({resource: 'order', scopes: ['create']})
  async createOrder(
    @param.path.string('userId') userId: string,
    @requestBody() order: Order,
  ): Promise<Order> {
    await this.userRepo.orders(userId).create(order);
  }
```

Publicly accessible APIs must be accessible regardless of user permissions and
so does not have to be decorated.

## Programming Access Policies

As part of authentication, client is sent back a token (JWT or similar) which
client need to pass in every API request headers thereafter.

- Users are expected to program access control policies in provider classes
- API throws **403 Forbidden** error if logged in user do not have sufficient
  permissions.
