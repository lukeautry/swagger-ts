// TODO: Replace this with HAPI middleware stuff
/* tslint:disable */
import * as hapi from 'hapi';
import { ValidateParam } from '../../../src/routeGeneration/templateHelpers';
import { Controller } from '../../../src/interfaces/controller';
import { PutTestController } from './../controllers/putController';
import { PostTestController } from './../controllers/postController';
import { PatchTestController } from './../controllers/patchController';
import { GetTestController } from './../controllers/getController';
import { DeleteTestController } from './../controllers/deleteController';
import { MethodController } from './../controllers/methodController';
import { ParameterController } from './../controllers/parameterController';
import { SecurityTestController } from './../controllers/securityController';
import { set } from 'lodash';
import { hapiAuthentication } from './authentication';
import * as fs from 'fs';
import * as crypto from 'crypto';
import * as path from 'path';
import * as mkdirp from 'mkdirp';

const models: any = {
  "TestModel": {
    properties: {
      "numberValue": { "required": true, "typeName": "double" },
      "numberArray": { "required": true, "typeName": "array", "array": { "typeName": "double" } },
      "stringValue": { "required": true, "typeName": "string" },
      "stringArray": { "required": true, "typeName": "array", "array": { "typeName": "string" } },
      "boolValue": { "required": true, "typeName": "boolean" },
      "boolArray": { "required": true, "typeName": "array", "array": { "typeName": "boolean" } },
      "enumValue": { "required": false, "typeName": "enum", "enumMembers": [0, 1] },
      "enumArray": { "required": false, "typeName": "array", "array": { "typeName": "enum", "enumMembers": [0, 1] } },
      "enumStringValue": { "required": false, "typeName": "enum", "enumMembers": ["VALUE_1", "VALUE_2"] },
      "enumStringArray": { "required": false, "typeName": "array", "array": { "typeName": "enum", "enumMembers": ["VALUE_1", "VALUE_2"] } },
      "modelValue": { "required": true, "typeName": "TestSubModel" },
      "modelsArray": { "required": true, "typeName": "array", "array": { "typeName": "TestSubModel" } },
      "strLiteralVal": { "required": true, "typeName": "enum", "enumMembers": ["Foo", "Bar"] },
      "strLiteralArr": { "required": true, "typeName": "array", "array": { "typeName": "enum", "enumMembers": ["Foo", "Bar"] } },
      "dateValue": { "required": false, "typeName": "datetime" },
      "optionalString": { "required": false, "typeName": "string" },
      "modelsObjectIndirect": { "required": false, "typeName": "TestSubModelContainer" },
      "modelsObjectIndirectNS": { "required": false, "typeName": "TestSubModelContainerNamespace.TestSubModelContainer" },
      "modelsObjectIndirectNS2": { "required": false, "typeName": "TestSubModelContainerNamespace.InnerNamespace.TestSubModelContainer2" },
      "modelsObjectIndirectNS_Alias": { "required": false, "typeName": "TestSubModelContainerNamespace_TestSubModelContainer" },
      "modelsObjectIndirectNS2_Alias": { "required": false, "typeName": "TestSubModelContainerNamespace_InnerNamespace_TestSubModelContainer2" },
      "id": { "required": true, "typeName": "double" },
    },
  },
  "TestSubModel": {
    properties: {
      "email": { "required": true, "typeName": "string" },
      "circular": { "required": false, "typeName": "TestModel" },
      "id": { "required": true, "typeName": "double" },
    },
  },
  "TestSubModel2": {
    properties: {
      "testSubModel2": { "required": true, "typeName": "boolean" },
      "email": { "required": true, "typeName": "string" },
      "circular": { "required": false, "typeName": "TestModel" },
      "id": { "required": true, "typeName": "double" },
    },
  },
  "TestSubModelContainer": {
    properties: {
    },
    additionalProperties: [
      { typeName: 'TestSubModel2' },
    ],
  },
  "TestSubModelNamespace.TestSubModelNS": {
    properties: {
      "testSubModelNS": { "required": true, "typeName": "boolean" },
      "email": { "required": true, "typeName": "string" },
      "circular": { "required": false, "typeName": "TestModel" },
      "id": { "required": true, "typeName": "double" },
    },
  },
  "TestSubModelContainerNamespace.TestSubModelContainer": {
    properties: {
    },
    additionalProperties: [
      { typeName: 'TestSubModelNamespace.TestSubModelNS' },
    ],
  },
  "TestSubModelContainerNamespace.InnerNamespace.TestSubModelContainer2": {
    properties: {
    },
    additionalProperties: [
      { typeName: 'TestSubModelNamespace.TestSubModelNS' },
    ],
  },
  "TestSubModelContainerNamespace_TestSubModelContainer": {
    properties: {
    },
  },
  "TestSubModelContainerNamespace_InnerNamespace_TestSubModelContainer2": {
    properties: {
    },
  },
  "TestClassModel": {
    properties: {
      "publicStringProperty": { "required": true, "typeName": "string" },
      "optionalPublicStringProperty": { "required": false, "typeName": "string" },
      "stringProperty": { "required": true, "typeName": "string" },
      "publicConstructorVar": { "required": true, "typeName": "string" },
      "optionalPublicConstructorVar": { "required": false, "typeName": "string" },
      "id": { "required": true, "typeName": "double" },
    },
  },
  "GenericRequestTestModel": {
    properties: {
      "name": { "required": true, "typeName": "string" },
      "value": { "required": true, "typeName": "TestModel" },
    },
  },
  "Result": {
    properties: {
      "value": { "required": true, "typeName": "object" },
    },
  },
  "GenericModelTestModel": {
    properties: {
      "result": { "required": true, "typeName": "TestModel" },
    },
  },
  "GenericModelTestModel[]": {
    properties: {
      "result": { "required": true, "typeName": "array", "array": { "typeName": "TestModel" } },
    },
  },
  "GenericModelstring": {
    properties: {
      "result": { "required": true, "typeName": "string" },
    },
  },
  "GenericModelstring[]": {
    properties: {
      "result": { "required": true, "typeName": "array", "array": { "typeName": "string" } },
    },
  },
  "ErrorResponseModel": {
    properties: {
      "status": { "required": true, "typeName": "double" },
      "message": { "required": true, "typeName": "string" },
    },
  },
  "ParameterTestModel": {
    properties: {
      "firstname": { "required": true, "typeName": "string" },
      "lastname": { "required": true, "typeName": "string" },
      "age": { "required": true, "typeName": "integer" },
      "weight": { "required": true, "typeName": "float" },
      "human": { "required": true, "typeName": "boolean" },
      "gender": { "required": true, "typeName": "enum", "enumMembers": ["MALE", "FEMALE"] },
    },
  },
  "UserResponseModel": {
    properties: {
      "id": { "required": true, "typeName": "double" },
      "name": { "required": true, "typeName": "string" },
    },
  },
};

interface Args {
  [key: string]: {
    in: string,
    name: string,
    required: boolean,
    typeName: string,
    enumMembers?: any[]
  }
}

export function RegisterRoutes(server: hapi.Server) {
  server.route({
    method: 'put',
    path: '/v1/PutTest',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
          model: { "in": "body", "name": "model", "required": true, "typeName": "TestModel" },
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new PutTestController();

        const promise = controller.putModel.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'put',
    path: '/v1/PutTest/Location',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new PutTestController();

        const promise = controller.putModelAtLocation.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'put',
    path: '/v1/PutTest/Multi',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new PutTestController();

        const promise = controller.putWithMultiReturn.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'put',
    path: '/v1/PutTest/WithId/{id}',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
          id: { "in": "path", "name": "id", "required": true, "typeName": "double" },
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new PutTestController();

        const promise = controller.putWithId.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'post',
    path: '/v1/PostTest',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
          model: { "in": "body", "name": "model", "required": true, "typeName": "TestModel" },
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new PostTestController();

        const promise = controller.postModel.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'patch',
    path: '/v1/PostTest',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
          model: { "in": "body", "name": "model", "required": true, "typeName": "TestModel" },
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new PostTestController();

        const promise = controller.updateModel.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'post',
    path: '/v1/PostTest/WithClassModel',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
          model: { "in": "body", "name": "model", "required": true, "typeName": "TestClassModel" },
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new PostTestController();

        const promise = controller.postClassModel.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'post',
    path: '/v1/PostTest/Location',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new PostTestController();

        const promise = controller.postModelAtLocation.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'post',
    path: '/v1/PostTest/Multi',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new PostTestController();

        const promise = controller.postWithMultiReturn.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'post',
    path: '/v1/PostTest/WithId/{id}',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
          id: { "in": "path", "name": "id", "required": true, "typeName": "double" },
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new PostTestController();

        const promise = controller.postWithId.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'post',
    path: '/v1/PostTest/WithBodyAndQueryParams',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
          model: { "in": "body", "name": "model", "required": true, "typeName": "TestModel" },
          query: { "in": "query", "name": "query", "required": true, "typeName": "string" },
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new PostTestController();

        const promise = controller.postWithBodyAndQueryParams.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'post',
    path: '/v1/PostTest/GenericBody',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
          genericReq: { "in": "body", "name": "genericReq", "required": true, "typeName": "GenericRequestTestModel" },
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new PostTestController();

        const promise = controller.getGenericRequest.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'post',
    path: '/v1/PostTest/File',
    config: {
      payload: {
        output: 'stream',
        parse: true,
        allow: 'multipart/form-data'
      },

      pre: [
        {
          method: fileUploadMiddleware('someFile', false)
        }
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
          aFile: { "in": "formData", "name": "someFile", "required": true, "typeName": "file" },
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new PostTestController();

        const promise = controller.postWithFile.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'post',
    path: '/v1/PostTest/ManyFilesAndFormFields',
    config: {
      payload: {
        output: 'stream',
        parse: true,
        allow: 'multipart/form-data'
      },

      pre: [
        {
          method: fileUploadMiddleware('someFiles', true)
        }
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
          files: { "in": "formData", "name": "someFiles", "required": true, "typeName": "file[]" },
          a: { "in": "formData", "name": "a", "required": true, "typeName": "string" },
          c: { "in": "formData", "name": "c", "required": true, "typeName": "string" },
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new PostTestController();

        const promise = controller.postWithFiles.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'patch',
    path: '/v1/PatchTest',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
          model: { "in": "body", "name": "model", "required": true, "typeName": "TestModel" },
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new PatchTestController();

        const promise = controller.patchModel.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'patch',
    path: '/v1/PatchTest/Location',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new PatchTestController();

        const promise = controller.patchModelAtLocation.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'patch',
    path: '/v1/PatchTest/Multi',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new PatchTestController();

        const promise = controller.patchWithMultiReturn.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'patch',
    path: '/v1/PatchTest/WithId/{id}',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
          id: { "in": "path", "name": "id", "required": true, "typeName": "double" },
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new PatchTestController();

        const promise = controller.patchWithId.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'get',
    path: '/v1/GetTest',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new GetTestController();

        const promise = controller.getModel.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'get',
    path: '/v1/GetTest/Current',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new GetTestController();

        const promise = controller.getCurrentModel.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'get',
    path: '/v1/GetTest/ClassModel',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new GetTestController();

        const promise = controller.getClassModel.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'get',
    path: '/v1/GetTest/Multi',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new GetTestController();

        const promise = controller.getMultipleModels.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'get',
    path: '/v1/GetTest/{numberPathParam}/{booleanPathParam}/{stringPathParam}',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
          numberPathParam: { "in": "path", "name": "numberPathParam", "required": true, "typeName": "double" },
          stringPathParam: { "in": "path", "name": "stringPathParam", "required": true, "typeName": "string" },
          booleanPathParam: { "in": "path", "name": "booleanPathParam", "required": true, "typeName": "boolean" },
          booleanParam: { "in": "query", "name": "booleanParam", "required": true, "typeName": "boolean" },
          stringParam: { "in": "query", "name": "stringParam", "required": true, "typeName": "string" },
          numberParam: { "in": "query", "name": "numberParam", "required": true, "typeName": "double" },
          optionalStringParam: { "in": "query", "name": "optionalStringParam", "required": false, "typeName": "string" },
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new GetTestController();

        const promise = controller.getModelByParams.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'get',
    path: '/v1/GetTest/ResponseWithUnionTypeProperty',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new GetTestController();

        const promise = controller.getResponseWithUnionTypeProperty.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'get',
    path: '/v1/GetTest/UnionTypeResponse',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new GetTestController();

        const promise = controller.getUnionTypeResponse.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'get',
    path: '/v1/GetTest/Request',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
          request: { "in": "request", "name": "request", "required": true, "typeName": "object" },
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new GetTestController();

        const promise = controller.getRequest.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'get',
    path: '/v1/GetTest/DateParam',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
          date: { "in": "query", "name": "date", "required": true, "typeName": "datetime" },
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new GetTestController();

        const promise = controller.getByDataParam.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'get',
    path: '/v1/GetTest/ThrowsError',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new GetTestController();

        const promise = controller.getThrowsError.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'get',
    path: '/v1/GetTest/GeneratesTags',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new GetTestController();

        const promise = controller.getGeneratesTags.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'get',
    path: '/v1/GetTest/HandleBufferType',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
          buffer: { "in": "query", "name": "buffer", "required": true, "typeName": "buffer" },
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new GetTestController();

        const promise = controller.getBuffer.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'get',
    path: '/v1/GetTest/GenericModel',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new GetTestController();

        const promise = controller.getGenericModel.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'get',
    path: '/v1/GetTest/GenericModelArray',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new GetTestController();

        const promise = controller.getGenericModelArray.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'get',
    path: '/v1/GetTest/GenericPrimitive',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new GetTestController();

        const promise = controller.getGenericPrimitive.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'get',
    path: '/v1/GetTest/GenericPrimitiveArray',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new GetTestController();

        const promise = controller.getGenericPrimitiveArray.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'delete',
    path: '/v1/DeleteTest',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new DeleteTestController();

        const promise = controller.deleteWithReturnValue.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'delete',
    path: '/v1/DeleteTest/Current',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new DeleteTestController();

        const promise = controller.deleteCurrent.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'delete',
    path: '/v1/DeleteTest/{numberPathParam}/{booleanPathParam}/{stringPathParam}',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
          numberPathParam: { "in": "path", "name": "numberPathParam", "required": true, "typeName": "double" },
          stringPathParam: { "in": "path", "name": "stringPathParam", "required": true, "typeName": "string" },
          booleanPathParam: { "in": "path", "name": "booleanPathParam", "required": true, "typeName": "boolean" },
          booleanParam: { "in": "query", "name": "booleanParam", "required": true, "typeName": "boolean" },
          stringParam: { "in": "query", "name": "stringParam", "required": true, "typeName": "string" },
          numberParam: { "in": "query", "name": "numberParam", "required": true, "typeName": "double" },
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new DeleteTestController();

        const promise = controller.getModelByParams.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'get',
    path: '/v1/MethodTest/Get',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new MethodController();

        const promise = controller.getMethod.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'post',
    path: '/v1/MethodTest/Post',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new MethodController();

        const promise = controller.postMethod.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'patch',
    path: '/v1/MethodTest/Patch',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new MethodController();

        const promise = controller.patchMethod.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'put',
    path: '/v1/MethodTest/Put',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new MethodController();

        const promise = controller.putMethod.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'delete',
    path: '/v1/MethodTest/Delete',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new MethodController();

        const promise = controller.deleteMethod.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'get',
    path: '/v1/MethodTest/Description',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new MethodController();

        const promise = controller.description.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'get',
    path: '/v1/MethodTest/Tags',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new MethodController();

        const promise = controller.tags.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'get',
    path: '/v1/MethodTest/MultiResponse',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new MethodController();

        const promise = controller.multiResponse.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'get',
    path: '/v1/MethodTest/SuccessResponse',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new MethodController();

        const promise = controller.successResponse.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'get',
    path: '/v1/MethodTest/ApiSecurity',
    config: {

      pre: [
        {
          method: authenticateMiddleware('api_key'
          )
        },
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new MethodController();

        const promise = controller.apiSecurity.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'get',
    path: '/v1/MethodTest/OauthSecurity',
    config: {

      pre: [
        {
          method: authenticateMiddleware('tsoa_auth'
            , ["write:pets", "read:pets"]
          )
        },
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new MethodController();

        const promise = controller.oauthSecurity.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'get',
    path: '/v1/MethodTest/DeprecatedMethod',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new MethodController();

        const promise = controller.deprecatedMethod.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'get',
    path: '/v1/MethodTest/SummaryMethod',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new MethodController();

        const promise = controller.summaryMethod.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'get',
    path: '/v1/ParameterTest/Query',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
          firstname: { "in": "query", "name": "firstname", "required": true, "typeName": "string" },
          lastname: { "in": "query", "name": "last_name", "required": true, "typeName": "string" },
          age: { "in": "query", "name": "age", "required": true, "typeName": "integer" },
          weight: { "in": "query", "name": "weight", "required": true, "typeName": "float" },
          human: { "in": "query", "name": "human", "required": true, "typeName": "boolean" },
          gender: { "in": "query", "name": "gender", "required": true, "typeName": "enum", "enumMembers": ["MALE", "FEMALE"] },
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new ParameterController();

        const promise = controller.getQuery.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'get',
    path: '/v1/ParameterTest/Path/{firstname}/{last_name}/{age}/{weight}/{human}/{gender}',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
          firstname: { "in": "path", "name": "firstname", "required": true, "typeName": "string" },
          lastname: { "in": "path", "name": "last_name", "required": true, "typeName": "string" },
          age: { "in": "path", "name": "age", "required": true, "typeName": "integer" },
          weight: { "in": "path", "name": "weight", "required": true, "typeName": "float" },
          human: { "in": "path", "name": "human", "required": true, "typeName": "boolean" },
          gender: { "in": "path", "name": "gender", "required": true, "typeName": "enum", "enumMembers": ["MALE", "FEMALE"] },
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new ParameterController();

        const promise = controller.getPath.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'get',
    path: '/v1/ParameterTest/Header',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
          firstname: { "in": "header", "name": "firstname", "required": true, "typeName": "string" },
          lastname: { "in": "header", "name": "last_name", "required": true, "typeName": "string" },
          age: { "in": "header", "name": "age", "required": true, "typeName": "integer" },
          weight: { "in": "header", "name": "weight", "required": true, "typeName": "float" },
          human: { "in": "header", "name": "human", "required": true, "typeName": "boolean" },
          gender: { "in": "header", "name": "gender", "required": true, "typeName": "enum", "enumMembers": ["MALE", "FEMALE"] },
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new ParameterController();

        const promise = controller.getHeader.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'get',
    path: '/v1/ParameterTest/Request',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
          request: { "in": "request", "name": "request", "required": true, "typeName": "object" },
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new ParameterController();

        const promise = controller.getRequest.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'post',
    path: '/v1/ParameterTest/Body',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
          body: { "in": "body", "name": "body", "required": true, "typeName": "ParameterTestModel" },
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new ParameterController();

        const promise = controller.getBody.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'post',
    path: '/v1/ParameterTest/BodyProps',
    config: {

      pre: [
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
          firstname: { "in": "body-prop", "name": "firstname", "required": true, "typeName": "string" },
          lastname: { "in": "body-prop", "name": "lastname", "required": true, "typeName": "string" },
          age: { "in": "body-prop", "name": "age", "required": true, "typeName": "integer" },
          weight: { "in": "body-prop", "name": "weight", "required": true, "typeName": "float" },
          human: { "in": "body-prop", "name": "human", "required": true, "typeName": "boolean" },
          gender: { "in": "body-prop", "name": "gender", "required": true, "typeName": "enum", "enumMembers": ["MALE", "FEMALE"] },
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new ParameterController();

        const promise = controller.getBodyProps.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'get',
    path: '/v1/SecurityTest',
    config: {

      pre: [
        {
          method: authenticateMiddleware('api_key'
          )
        },
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
          request: { "in": "request", "name": "request", "required": true, "typeName": "object" },
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new SecurityTestController();

        const promise = controller.GetWithApi.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'get',
    path: '/v1/SecurityTest/Koa',
    config: {

      pre: [
        {
          method: authenticateMiddleware('api_key'
          )
        },
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
          ctx: { "in": "request", "name": "ctx", "required": true, "typeName": "object" },
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new SecurityTestController();

        const promise = controller.GetWithApiForKoa.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });
  server.route({
    method: 'get',
    path: '/v1/SecurityTest/Oauth',
    config: {

      pre: [
        {
          method: authenticateMiddleware('tsoa_auth'
            , ["write:pets", "read:pets"]
          )
        },
      ],
      handler: (request: any, reply: hapi.IReply) => {
        const args: Args = {
          request: { "in": "request", "name": "request", "required": true, "typeName": "object" },
        };

        let validatedArgs: any[] = [];
        try {
          validatedArgs = getValidatedArgs(args, request);
        } catch (err) {
          return reply(err).code(err.status || 500);
        }

        const controller = new SecurityTestController();

        const promise = controller.GetWithSecurity.apply(controller, validatedArgs);
        let statusCode = undefined;
        if (controller instanceof Controller) {
          statusCode = (controller as Controller).getStatus();
        }
        return promiseHandler(promise, statusCode, request, reply);
      }
    }
  });

  function authenticateMiddleware(name: string, scopes: string[] = []) {
    return (request: hapi.Request, reply: hapi.IReply) => {
      hapiAuthentication(request, name, scopes).then((user: any) => {
        set(request, 'user', user);
        reply.continue();
      })
        .catch((error: any) => reply(error).code(error.status || 401));
    }
  }

  function fileUploadMiddleware(fieldname: string, multiple: boolean = false) {
    return (request: hapi.Request, reply: hapi.IReply) => {
      if (!request.payload[fieldname]) {
        return reply(`${fieldname} is a required file(s).`).code(400);
      }

      const calculateFileInfo = (reqFile: any) => new Promise((resolve, reject) => {
        const originalname = reqFile.hapi.filename;
        const headers = reqFile.hapi.headers;
        const contentTransferEncoding = headers['content-transfer-encoding'];
        const encoding = contentTransferEncoding &&
          contentTransferEncoding[0] &&
          contentTransferEncoding[0].toLowerCase() || '7bit';
        const mimetype = headers['content-type'] || 'text/plain';
        const destination = './uploads';
        const filename = crypto.pseudoRandomBytes(16).toString('hex');
        const filePath = path.join(destination, filename);
        return mkdirp(destination, err => {
          if (err) {
            return reject(err);
          }
          const file = fs.createWriteStream(filePath);

          reqFile.pipe(file);

          return reqFile.on('end', (err?: Error) => {
            if (err) {
              return reject(err);
            }
            return fs.stat(filePath, (err, stats) => {
              return resolve({
                fieldname,
                originalname,
                encoding,
                mimetype,
                destination,
                filename,
                path: filePath,
                size: stats.size,
              });
            });
          });
        });
      });

      if (!multiple) {
        return calculateFileInfo(request.payload[fieldname])
          .then(fileMetadata => {
            request.payload[fieldname] = fileMetadata;
            return reply.continue();
          })
          .catch(err => reply(err.toString()).code(500));
      } else {
        const promises = request.payload[fieldname].map((reqFile: any) => calculateFileInfo(reqFile));
        return Promise.all(promises)
          .then(filesMetadata => {
            request.payload[fieldname] = filesMetadata;
            return reply.continue();
          })
          .catch(err => reply(err.toString()).code(500));
      }
    };
  }

  function promiseHandler(promise: any, statusCode: any, request: hapi.Request, reply: hapi.IReply) {
    return promise
      .then((data: any) => {
        if (data) {
          return reply(data).code(statusCode || 200);
        } else {
          return (reply as any)().code(statusCode || 204);
        }
      })
      .catch((error: any) => reply(error).code(error.status || 500));
  }

  function getValidatedArgs(args: any, request: hapi.Request): any[] {
    return Object.keys(args).map(key => {
      const name = args[key].name;
      switch (args[key].in) {
        case 'request':
          return request;
        case 'query':
          return ValidateParam(args[key], request.query[name], models, name);
        case 'path':
          return ValidateParam(args[key], request.params[name], models, name);
        case 'header':
          return ValidateParam(args[key], request.headers[name], models, name);
        case 'body':
          return ValidateParam(args[key], request.payload, models, name);
        case 'body-prop':
          return ValidateParam(args[key], request.payload[name], models, name);
        case 'formData':
          return ValidateParam(args[key], request.payload[name], models, name);
      }
    });
  }
}
