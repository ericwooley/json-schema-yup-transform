import isNumber from "lodash/isNumber";
import capitalize from "lodash/capitalize";
import { DataTypes, SchemaKeywords } from "../../../schema";
import type { JSONSchema } from "../../../schema"
import type { SchemaItem } from "../../types";
import { getErrorMessage } from "../../config";
import Yup from "../../addMethods";
import { createRequiredSchema } from "../required";
import { createConstantSchema } from "../constant";
import { createEnumerableSchema } from "../enumerables";

/**
 * Initializes a yup number schema derived from a json number schema
 */

const createNumberSchema = (
  [key, value]: SchemaItem,
  jsonSchema: JSONSchema
): Yup.NumberSchema<number> => {
  const { description, title } = value;

  const label = title || capitalize(key);

  const defaultMessage =
    getErrorMessage(description, DataTypes.NUMBER, [key, { title }]) ||
    `${label} is not of type number`;

  return createBaseNumberSchema(
    Yup.number().typeError(defaultMessage),
    [key, value],
    jsonSchema
  );
};
/**
 * Generates a yup number schema instance that is used for both number and integer schema
 */

export const createBaseNumberSchema = (
  Schema: Yup.NumberSchema,
  [key, value]: SchemaItem,
  jsonSchema: JSONSchema
): Yup.NumberSchema<number> => {
  const {
    description,
    default: defaults,
    minimum,
    maximum,
    exclusiveMaximum,
    exclusiveMinimum,
    multipleOf,
    title
  } = value;

  const label = title || capitalize(key);

  const isMinNumber = isNumber(minimum);
  const isMaxNumber = isNumber(maximum);
  const isExclusiveMaxNumber = isNumber(exclusiveMaximum);
  const isExclusiveMinNumber = isNumber(exclusiveMinimum);

  if (isNumber(defaults)) {
    Schema = Schema.concat(Schema.default(defaults));
  }

  if (isExclusiveMinNumber && isMinNumber) {
    throw new Error(
      "Minimum and exclusive minimum keys can not be used together"
    );
  }

  if (isExclusiveMaxNumber && isMaxNumber) {
    throw new Error(
      "Maximum and exclusive maximum keys can not be used together"
    );
  }

  // Minimum value is inclusive
  if (isMinNumber) {
    const message =
      getErrorMessage(description, SchemaKeywords.MINIMUM, [
        key,
        { title, minimum }
      ]) || capitalize(`${label} requires a minimum value of ${minimum}`);

    Schema = Schema.concat(Schema.min(minimum as number, message));
  }

  if (isExclusiveMinNumber) {
    const message =
      getErrorMessage(description, SchemaKeywords.EXCLUSIVE_MINIMUM, [
        key,
        { title, exclusiveMinimum }
      ]) ||
      capitalize(
        `${label} requires a exclusive minimum value of ${exclusiveMinimum}`
      );

    Schema = Schema.concat(
      Schema.min((exclusiveMinimum as number) + 1, message)
    );
  }

  // Maximum value is inclusive
  if (isMaxNumber) {
    const message =
      getErrorMessage(description, SchemaKeywords.MAXIMUM, [
        key,
        { title, maximum }
      ]) || capitalize(`${label} cannot exceed a maximum value of ${maximum}`);

    Schema = Schema.concat(Schema.max(maximum as number, message));
  }

  if (isExclusiveMaxNumber) {
    const message =
      getErrorMessage(description, SchemaKeywords.EXCLUSIVE_MAXIMUM, [
        key,
        { title, exclusiveMaximum }
      ]) ||
      capitalize(
        `${label} cannot exceed a exclusive maximum value of ${exclusiveMaximum}`
      );

    Schema = Schema.concat(
      Schema.max((exclusiveMaximum as number) - 1, message)
    );
  }

  if (multipleOf) {
    const message =
      getErrorMessage(description, SchemaKeywords.MULTIPLE_OF, [
        key,
        { title, multipleOf }
      ]) || capitalize(`${label} requires a multiple of ${multipleOf}`);

    // `multipleOf` is a custom yup method. See /yup/addons/index.ts
    // for implementation
    Schema = Schema.concat(Schema.multipleOf(multipleOf, message));
  }

  /** Determine if schema matches constant */
  Schema = createConstantSchema(Schema, [key, value]);

  /** Determine if schema matches any enums */
  Schema = createEnumerableSchema(Schema, [key, value]);

  /** Set required if ID is in required schema */
  Schema = createRequiredSchema(Schema, jsonSchema, [key, value]);

  return Schema;
};

export default createNumberSchema;
