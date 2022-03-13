import * as Yup from "yup";
import type { JSONSchemaExtended } from "../../src/schema";
import convertToYup from "../../src";

describe("convertToYup() string", () => {
  it("should validate string type", () => {
    const schema: JSONSchemaExtended = {
      type: "object",
      $schema: "http://json-schema.org/draft-07/schema#",
      $id: "test",
      title: "Test",
      properties: {
        name: {
          type: "string"
        }
      }
    };
    const yupschema = convertToYup(schema) as Yup.ObjectSchema<any>;

    let isValid = yupschema.isValidSync({
      name: "test"
    });
    expect(isValid).toBeTruthy();

    isValid = yupschema.isValidSync({
      name: null
    });
    expect(isValid).toBeFalsy();
  });

  it("should validate multiple types", () => {
    const schema: JSONSchemaExtended = {
      type: "object",
      $schema: "http://json-schema.org/draft-07/schema#",
      $id: "test",
      title: "Test",
      properties: {
        name: {
          type: ["string", "null"]
        }
      }
    };
    const yupschema = convertToYup(schema) as Yup.ObjectSchema<any>;

    let isValid = yupschema.isValidSync({
      name: "test"
    });
    expect(isValid).toBeTruthy();

    isValid = yupschema.isValidSync({
      name: null
    });
    expect(isValid).toBeTruthy();

    isValid = yupschema.isValidSync({
      name: ""
    });
    expect(isValid).toBeTruthy();
  });

  it("should throw error if value type is not one of multiple types", () => {
    const schema: JSONSchemaExtended = {
      type: "object",
      $schema: "http://json-schema.org/draft-07/schema#",
      $id: "test",
      title: "Test",
      properties: {
        name: {
          type: ["string", "null"]
        }
      }
    };
    const yupschema = convertToYup(schema) as Yup.ObjectSchema<any>;
    expect(() => {
      yupschema.isValidSync({
        name: []
      });
    }).toBeTruthy();
  });

  it("should validate required", () => {
    const schema: JSONSchemaExtended = {
      type: "object",
      $schema: "http://json-schema.org/draft-07/schema#",
      $id: "test",
      title: "Test",
      properties: {
        name: {
          type: "string"
        }
      },
      required: ["name"]
    };

    let yupschema = convertToYup(schema) as Yup.ObjectSchema<any>;
    let valid = yupschema.isValidSync({
      name: "test"
    });
    expect(valid).toBeTruthy();

    valid = yupschema.isValidSync({});
    expect(valid).toBeFalsy();

    let errorMessage;
    try {
      errorMessage = yupschema.validateSync({});
    } catch (e: unknown) {
      if (e instanceof Yup.ValidationError) errorMessage = e.errors[0];
    }
    expect(errorMessage).toBe("This field is required");
  });

  it("should validate minimum character length", () => {
    const schema: JSONSchemaExtended = {
      type: "object",
      $schema: "http://json-schema.org/draft-07/schema#",
      $id: "test",
      title: "Test",
      properties: {
        name: {
          type: "string",
          minLength: 6
        }
      }
    };
    let yupschema = convertToYup(schema) as Yup.ObjectSchema<any>;
    let valid = yupschema.isValidSync({
      name: "abcdef"
    });
    expect(valid).toBeTruthy();

    valid = yupschema.isValidSync({ name: "abcd" });
    expect(valid).toBeFalsy();

    valid = yupschema.isValidSync({ name: null });
    expect(valid).toBeFalsy();

    let errorMessage;
    try {
      errorMessage = yupschema.validateSync({ name: "abcd" });
    } catch (e: unknown) {
      if (e instanceof Yup.ValidationError) errorMessage = e.errors[0];
    }
    expect(errorMessage).toBe("This field requires a minimum of 6 characters");
  });

  it("should validate maximum character length", () => {
    const schema: JSONSchemaExtended = {
      type: "object",
      $schema: "http://json-schema.org/draft-07/schema#",
      $id: "test",
      title: "Test",
      properties: {
        name: {
          type: "string",
          maxLength: 6
        }
      }
    };
    let yupschema = convertToYup(schema) as Yup.ObjectSchema<any>;
    let valid = yupschema.isValidSync({
      name: "abcdef"
    });
    expect(valid).toBeTruthy();

    valid = yupschema.isValidSync({ name: "abcdefgh" });
    expect(valid).toBeFalsy();

    valid = yupschema.isValidSync({ name: null });
    expect(valid).toBeFalsy();

    let errorMessage;
    try {
      errorMessage = yupschema.validateSync({ name: "abcdefgh" });
    } catch (e: unknown) {
      if (e instanceof Yup.ValidationError) errorMessage = e.errors[0];
    }
    expect(errorMessage).toBe("This field cannot exceed a maximum of 6 characters");
  });

  it("should validate pattern", () => {
    const schema: JSONSchemaExtended = {
      type: "object",
      $schema: "http://json-schema.org/draft-07/schema#",
      $id: "test",
      title: "Test",
      properties: {
        name: {
          type: "string",
          pattern: "^(\\([0-9]{3}\\))?[0-9]{3}-[0-9]{4}$"
        }
      }
    };
    let yupschema = convertToYup(schema) as Yup.ObjectSchema<any>;
    let valid = yupschema.isValidSync({
      name: "555-1212"
    });
    expect(valid).toBeTruthy();

    valid = yupschema.isValidSync({
      name: "(888)555-1212"
    });
    expect(valid).toBeTruthy();

    valid = yupschema.isValidSync({ name: "(888)555-1212 ext. 532" });
    expect(valid).toBeFalsy();

    valid = yupschema.isValidSync({ name: null });
    expect(valid).toBeFalsy();

    let errorMessage;
    try {
      errorMessage = yupschema.validateSync({ name: "(800)FLOWERS" });
    } catch (e: unknown) {
      if (e instanceof Yup.ValidationError) errorMessage = e.errors[0];
    }
    expect(errorMessage).toBe("This field is an incorrect format");
  });

  it("should validate constant", () => {
    const schema: JSONSchemaExtended = {
      type: "object",
      $schema: "http://json-schema.org/draft-07/schema#",
      $id: "test",
      title: "Test",
      properties: {
        name: {
          type: "string",
          const: "test"
        }
      }
    };
    const yupschema = convertToYup(schema) as Yup.ObjectSchema<any>;

    let isValid = yupschema.isValidSync({
      name: "test"
    });
    expect(isValid).toBeTruthy();

    isValid = yupschema.isValidSync({
      name: "blah"
    });
    expect(isValid).toBeFalsy();

    let errorMessage;
    try {
      errorMessage = yupschema.validateSync({ name: "(800)FLOWERS" });
    } catch (e: unknown) {
      if (e instanceof Yup.ValidationError) errorMessage = e.errors[0];
    }
    expect(errorMessage).toBe("This field does not match constant");
  });

  it("should validate enum", () => {
    const schema: JSONSchemaExtended = {
      type: "object",
      $schema: "http://json-schema.org/draft-07/schema#",
      $id: "test",
      title: "Test",
      properties: {
        name: {
          type: "string",
          enum: ["test", "other"]
        }
      }
    };
    const yupschema = convertToYup(schema) as Yup.ObjectSchema<any>;

    let isValid = yupschema.isValidSync({
      name: "test"
    });
    expect(isValid).toBeTruthy();

    isValid = yupschema.isValidSync({
      name: "other"
    });
    expect(isValid).toBeTruthy();

    isValid = yupschema.isValidSync({
      name: "blah"
    });
    expect(isValid).toBeFalsy();

    let errorMessage;
    try {
      errorMessage = yupschema.validateSync({ name: "(800)FLOWERS" });
    } catch (e: unknown) {
      if (e instanceof Yup.ValidationError) errorMessage = e.errors[0];
    }
    expect(errorMessage).toBe("This field does not match any of the enumerables");
  });

  it("should set default value", () => {
    const defaultValue = "Roger";
    const schema: JSONSchemaExtended = {
      type: "object",
      $schema: "http://json-schema.org/draft-07/schema#",
      $id: "test",
      title: "Test",
      properties: {
        name: {
          type: "string",
          default: defaultValue
        }
      },
      required: ["name"]
    };

    let yupschema = convertToYup(schema) as Yup.ObjectSchema<any>;
    let isValid = yupschema
      .test(
        "is-default",
        "${path} is default value",
        (value) => value.name === defaultValue
      )
      .isValidSync({});

    expect(isValid).toBeTruthy();
  });

  it("should not validate empty value if field has multiple types", () => {
    const schema: JSONSchemaExtended = {
      type: "object",
      $schema: "http://json-schema.org/draft-07/schema#",
      $id: "test",
      title: "Test",
      properties: {
        name: {
          type: ["string", "null"],
          pattern: "[\\-0-9A-Za-z]"
        }
      }
    };
    const yupschema = convertToYup(schema) as Yup.ObjectSchema<any>;

    let isValid = yupschema.isValidSync({
      name: ""
    });
    expect(isValid).toBeTruthy();

    isValid = yupschema.isValidSync({
      name: null
    });
    expect(isValid).toBeTruthy();
  });

  it("should validate regex", () => {
    const schema: JSONSchemaExtended = {
      type: "object",
      $schema: "http://json-schema.org/draft-07/schema#",
      $id: "test",
      title: "Test",
      properties: {
        name: {
          type: "string",
          regex: "^(\\([0-9]{3}\\))?[0-9]{3}-[0-9]{4}$"
        }
      }
    };
    let yupschema = convertToYup(schema) as Yup.ObjectSchema<any>;
    let valid = yupschema.isValidSync({
      name: "555-1212"
    });
    expect(valid).toBeTruthy();

    valid = yupschema.isValidSync({
      name: "(888)555-1212"
    });
    expect(valid).toBeTruthy();

    valid = yupschema.isValidSync({ name: "(888)555-1212 ext. 532" });
    expect(valid).toBeFalsy();

    valid = yupschema.isValidSync({ name: null });
    expect(valid).toBeFalsy();

    let errorMessage;
    try {
      errorMessage = yupschema.validateSync({ name: "(800)FLOWERS" });
    } catch (e: unknown) {
      if (e instanceof Yup.ValidationError) errorMessage = e.errors[0];
    }
    expect(errorMessage).toBe("This field is an incorrect format");
  });

  it("should validate multiple types in a nested object", () => {
    const schema: JSONSchemaExtended = {
      type: "object",
      $schema: "http://json-schema.org/draft-07/schema#",
      $id: "test",
      title: "Test",
      properties: {
        address: {
          type: "object",
          properties: {
            name: {
              type: ["string", "null"]
            }
          }
        }
      }
    };
    const yupschema = convertToYup(schema) as Yup.ObjectSchema<any>;

    expect(() => {
      yupschema.isValidSync({
        address: {
          name: ""
        }
      });
    }).toBeTruthy();

    expect(() => {
      yupschema.isValidSync({
        address: {
          name: null
        }
      });
    }).toBeTruthy();
  });
});
