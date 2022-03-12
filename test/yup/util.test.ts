import type { JSONSchema } from "../../src/schema"
import {
  getObjectHead,
  removeEmptyObjects,
  transformRefs,
  applyIfTypes,
  applyPaths,
  normalize
} from "../../src/yup/utils";

describe("removeEmptyObjects()", () => {
  it("should remove empty objects", () => {
    expect(
      removeEmptyObjects({
        type: "object",
        $schema: "http://json-schema.org/draft-07/schema#",
        $id: "test",
        title: "Test",
        properties: {
          name: {
            type: "string"
          }
        },
        if: {},
        then: { properties: {} }
      })
    ).toEqual({
      type: "object",
      $schema: "http://json-schema.org/draft-07/schema#",
      $id: "test",
      title: "Test",
      properties: {
        name: {
          type: "string"
        }
      }
    });

    expect(
      removeEmptyObjects({
        type: "object",
        $schema: "http://json-schema.org/draft-07/schema#",
        $id: "test",
        title: "Test",
        properties: {
          name: {
            type: "array",
            items: [{ type: "string" }]
          }
        },
        if: {},
        then: { properties: {} }
      })
    ).toEqual({
      type: "object",
      $schema: "http://json-schema.org/draft-07/schema#",
      $id: "test",
      title: "Test",
      properties: {
        name: {
          type: "array",
          items: [{ type: "string" }]
        }
      }
    });

    expect(
      removeEmptyObjects({
        type: "object",
        $schema: "http://json-schema.org/draft-07/schema#",
        $id: "test",
        title: "Test",
        properties: {
          name: {
            type: "array",
            items: []
          }
        }
      })
    ).toEqual({
      type: "object",
      $schema: "http://json-schema.org/draft-07/schema#",
      $id: "test",
      title: "Test",
      properties: {
        name: {
          type: "array",
          items: []
        }
      }
    });
  });
});

describe("applyPaths()", () => {
  it("should add node paths to all fields", () => {
    const schema: JSONSchema = {
      $schema: "http://json-schema.org/draft-07/schema#",
      $id: "vehicles",
      description: "Vehicles",
      type: "object",
      definitions: {
        vehicle: {
          type: "object",
          properties: {
            model: {
              type: "string",
              minLength: 1,
              maxLength: 30
            },
            isImported: {
              type: "boolean",
              minLength: 1,
              maxLength: 8
            }
          },
          required: ["model", "isImported"],
          if: {
            properties: {
              isImported: {
                const: true
              }
            }
          },
          then: {
            properties: {
              country: {
                type: "string",
                minLength: 1,
                maxLength: 8
              }
            },
            required: ["country"]
          },
          else: {
            properties: {
              year: {
                type: "number"
              }
            },
            required: ["year"],
            if: {
              properties: {
                year: {
                  const: 1980
                }
              }
            },
            then: {
              properties: {
                dealer: {
                  type: "string",
                  minLength: 1,
                  maxLength: 8
                }
              },
              required: ["dealer"]
            }
          }
        }
      },
      properties: {
        isCommercial: {
          type: "boolean"
        }
      },
      required: ["isCommercial"],
      if: {
        properties: {
          isCommercial: {
            const: false
          }
        }
      },
      then: {
        properties: {
          vehicles: {
            type: "array",
            items: {
              $ref: "#/definitions/vehicle"
            },
            minItems: 1,
            maxItems: 5
          }
        },
        required: ["vehicles"]
      }
    };
    expect(applyPaths(schema)).toEqual({
      $schema: "http://json-schema.org/draft-07/schema#",
      $id: "vehicles",
      description: "Vehicles",
      type: "object",
      definitions: {
        vehicle: {
          type: "object",
          properties: {
            model: {
              type: "string",
              minLength: 1,
              maxLength: 30,
              description: "vehicle.model"
            },
            isImported: {
              type: "boolean",
              minLength: 1,
              maxLength: 8,
              description: "vehicle.isImported"
            }
          },
          required: ["model", "isImported"],
          if: {
            properties: {
              isImported: {
                const: true
              }
            }
          },
          then: {
            properties: {
              country: {
                type: "string",
                minLength: 1,
                maxLength: 8,
                description: "vehicle.country"
              }
            },
            required: ["country"]
          },
          else: {
            properties: {
              year: {
                type: "number",
                description: "vehicle.year"
              }
            },
            required: ["year"],
            if: {
              properties: {
                year: {
                  const: 1980
                }
              }
            },
            then: {
              properties: {
                dealer: {
                  type: "string",
                  minLength: 1,
                  maxLength: 8,
                  description: "vehicle.dealer"
                }
              },
              required: ["dealer"]
            }
          }
        }
      },
      properties: {
        isCommercial: {
          type: "boolean",
          description: "isCommercial"
        }
      },
      required: ["isCommercial"],
      if: {
        properties: {
          isCommercial: {
            const: false
          }
        }
      },
      then: {
        properties: {
          vehicles: {
            description: "vehicles",
            type: "array",
            items: {
              $ref: "#/definitions/vehicle"
            },
            minItems: 1,
            maxItems: 5
          }
        },
        required: ["vehicles"]
      }
    });
  });
});

describe("applyIfTypes()", () => {
  it("should not add types if property schema has no type property", () => {
    const schema: JSONSchema = {
      type: "object",
      $schema: "http://json-schema.org/draft-07/schema#",
      $id: "test",
      title: "Test",
      properties: {
        country: {
          enum: ["Australia", "Canada"]
        }
      },
      required: ["country"],
      if: {
        properties: { country: { const: "Australia" } }
      },
      then: {
        properties: {
          postal_code: { pattern: "[0-9]{5}(-[0-9]{4})?" }
        }
      }
    };
    expect(applyIfTypes(schema)).toEqual(schema);
  });

  it("should not add types if property schema is empty", () => {
    const schema: JSONSchema = {
      type: "object",
      $schema: "http://json-schema.org/draft-07/schema#",
      $id: "test",
      title: "Test",
      properties: {
        country: {
          enum: ["Australia", "Canada"]
        }
      },
      required: ["country"],
      if: {
        properties: {}
      },
      then: {
        properties: {
          postal_code: { pattern: "[0-9]{5}(-[0-9]{4})?" }
        }
      }
    };
    expect(applyIfTypes(schema)).toEqual(schema);
  });

  it("should not add types if schema is empty", () => {
    const schema: JSONSchema = {
      type: "object",
      $schema: "http://json-schema.org/draft-07/schema#",
      $id: "test",
      title: "Test",
      properties: {
        country: {
          enum: ["Australia", "Canada"]
        }
      },
      required: ["country"],
      if: {},
      then: {
        properties: {
          postal_code: { pattern: "[0-9]{5}(-[0-9]{4})?" }
        }
      }
    };
    expect(applyIfTypes(schema)).toEqual(schema);
  });
  it("should not add types if property item is empty", () => {
    const schema: JSONSchema = {
      type: "object",
      $schema: "http://json-schema.org/draft-07/schema#",
      $id: "test",
      title: "Test",
      properties: {
        country: {
          enum: ["Australia", "Canada"]
        }
      },
      required: ["country"],
      if: { properties: { country: {} } },
      then: {
        properties: {
          postal_code: { pattern: "[0-9]{5}(-[0-9]{4})?" }
        }
      }
    };
    expect(applyIfTypes(schema)).toEqual(schema);
  });

  it("should not add types if schema property item is not an object", () => {
    const schema: JSONSchema = {
      type: "object",
      $schema: "http://json-schema.org/draft-07/schema#",
      $id: "test",
      title: "Test",
      properties: {
        country: {
          enum: ["Australia", "Canada"]
        }
      },
      required: ["country"],
      if: { properties: { country: false } },
      then: {
        properties: {
          postal_code: { pattern: "[0-9]{5}(-[0-9]{4})?" }
        }
      }
    };
    expect(applyIfTypes(schema)).toEqual(schema);
  });
  it("should add types to all if schemas", () => {
    const schema: JSONSchema = {
      $schema: "http://json-schema.org/draft-07/schema#",
      $id: "vehicles",
      description: "Vehicles",
      type: "object",
      definitions: {
        vehicle: {
          type: "object",
          properties: {
            model: {
              type: "string",
              minLength: 1,
              maxLength: 30
            },
            isImported: {
              type: "boolean",
              minLength: 1,
              maxLength: 8
            }
          },
          required: ["model", "isImported"],
          if: {
            properties: {
              isImported: {
                const: true
              }
            }
          },
          then: {
            properties: {
              country: {
                type: "string",
                minLength: 1,
                maxLength: 8
              }
            },
            required: ["country"]
          },
          else: {
            properties: {
              year: {
                type: "number"
              }
            },
            required: ["year"],
            if: {
              properties: {
                year: {
                  const: 1980
                }
              }
            },
            then: {
              properties: {
                dealer: {
                  type: "string",
                  minLength: 1,
                  maxLength: 8
                }
              },
              required: ["dealer"]
            }
          }
        }
      },
      properties: {
        isCommercial: {
          type: "boolean"
        }
      },
      required: ["isCommercial"],
      if: {
        properties: {
          isCommercial: {
            const: false
          }
        }
      },
      then: {
        properties: {
          vehicles: {
            type: "array",
            items: {
              $ref: "#/definitions/vehicle"
            },
            minItems: 1,
            maxItems: 5
          }
        },
        required: ["vehicles"]
      }
    };
    expect(applyIfTypes(schema)).toEqual({
      $schema: "http://json-schema.org/draft-07/schema#",
      $id: "vehicles",
      description: "Vehicles",
      type: "object",
      definitions: {
        vehicle: {
          type: "object",
          properties: {
            model: {
              type: "string",
              minLength: 1,
              maxLength: 30
            },
            isImported: {
              type: "boolean",
              minLength: 1,
              maxLength: 8
            }
          },
          required: ["model", "isImported"],
          if: {
            properties: {
              isImported: {
                const: true,
                type: "boolean"
              }
            }
          },
          then: {
            properties: {
              country: {
                type: "string",
                minLength: 1,
                maxLength: 8
              }
            },
            required: ["country"]
          },
          else: {
            properties: {
              year: {
                type: "number"
              }
            },
            required: ["year"],
            if: {
              properties: {
                year: {
                  const: 1980,
                  type: "number"
                }
              }
            },
            then: {
              properties: {
                dealer: {
                  type: "string",
                  minLength: 1,
                  maxLength: 8
                }
              },
              required: ["dealer"]
            }
          }
        }
      },
      properties: {
        isCommercial: {
          type: "boolean"
        }
      },
      required: ["isCommercial"],
      if: {
        properties: {
          isCommercial: {
            type: "boolean",
            const: false
          }
        }
      },
      then: {
        properties: {
          vehicles: {
            type: "array",
            items: {
              $ref: "#/definitions/vehicle"
            },
            minItems: 1,
            maxItems: 5
          }
        },
        required: ["vehicles"]
      }
    });
  });
});

describe("transformRefs()", () => {
  it("should replace $ref property with definition", () => {
    expect(
      transformRefs({
        type: "object",
        $schema: "http://json-schema.org/draft-07/schema#",
        $id: "test",
        title: "Test",
        definitions: {
          employment: {
            type: "string"
          }
        },
        properties: {
          name: {
            type: "string"
          }
        },
        if: { properties: { name: { type: "string", const: "Jane" } } },
        then: {
          properties: {
            career: { $ref: "#/definitions/employment" }
          }
        }
      })
    ).toEqual({
      type: "object",
      $schema: "http://json-schema.org/draft-07/schema#",
      $id: "test",
      title: "Test",
      definitions: {
        employment: {
          type: "string"
        }
      },
      properties: {
        name: {
          type: "string"
        }
      },
      if: { properties: { name: { type: "string", const: "Jane" } } },
      then: {
        properties: {
          career: { type: "string" }
        }
      }
    });
  });
});

describe("normalize()", () => {
  it("should normalize schema", () => {
    expect(
      normalize({
        type: "object",
        $schema: "http://json-schema.org/draft-07/schema#",
        $id: "test",
        title: "Test",
        definitions: {
          employment: {
            type: "string"
          }
        },
        properties: {
          name: {
            type: "string"
          },
          age: {}
        },
        if: { properties: { name: { const: "Jane" } } },
        then: {
          properties: {
            career: { $ref: "#/definitions/employment" }
          }
        }
      })
    ).toEqual({
      type: "object",
      $schema: "http://json-schema.org/draft-07/schema#",
      $id: "test",
      title: "Test",
      definitions: {
        employment: {
          type: "string",
          description: "employment"
        }
      },
      properties: {
        name: {
          type: "string",
          description: "name"
        }
      },
      if: { properties: { name: { type: "string", const: "Jane" } } },
      then: {
        properties: {
          career: { type: "string", description: "career" }
        }
      }
    });
  });
});

describe("getObjectHead()", () => {
  it("should return first item in object as an array", () => {
    expect(getObjectHead({ a: "1", b: "2", c: "2" })).toEqual(["a", "1"]);
    expect(getObjectHead("test")).toBeFalsy();
    expect(getObjectHead({})).toBeFalsy();
  });
});