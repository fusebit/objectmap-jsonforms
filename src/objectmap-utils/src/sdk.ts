import dot from 'dot-object';

const getKeyWithoutLastElement = (key: string) => {
  const splittedKey = key.split('.');
  const keyWithoutLastElement = splittedKey.slice(0, splittedKey.length - 1).join('.');
  return keyWithoutLastElement;
};

const parseKey = (key: string) => {
  const keyWithoutProperties = key.split('properties.').join('');
  const objectKey = getKeyWithoutLastElement(keyWithoutProperties);
  return objectKey;
};

const generateEnum = (schema: any) => {
  const schemaEnum: any = [];

  Object.keys(dot.dot(schema.properties)).forEach((key) => {
    const value = parseKey(key);
    const baseKey = getKeyWithoutLastElement(key);
    const objectProperties = dot.pick(baseKey, schema.properties);
    const baseObject = { value, ...objectProperties };
    const isEnumIncluded = schemaEnum.find((val: any) => val.value === value);
    if (!isEnumIncluded) {
      schemaEnum.push(baseObject);
    }
  });

  return schemaEnum;
};

export const getKeyByUiSchemaType = (uischema: any, type: string) => {
  let objectKey = null;

  Object.keys(dot.dot(uischema)).forEach((element) => {
    if (element.includes('type') && dot.pick(element, uischema) === type) {
      const scopePicker = element.replace('type', 'scope');
      const scope = dot.pick(scopePicker, uischema);
      const splittedScope = scope.split('/');
      const key = splittedScope[splittedScope.length - 1];
      objectKey = key;
    }
  });

  return objectKey;
};

export const createSchema = ({
  source,
  target,
  uischema,
  dataToTransform,
}: {
  source: any;
  target: any;
  uischema: any;
  dataToTransform: any;
}) => {
  const objectMapKey: any = getKeyByUiSchemaType(uischema, 'ObjectMap');
  const sourceTableKey: any = getKeyByUiSchemaType(uischema, 'SourceTable');
  const TransformedTableKey: any = getKeyByUiSchemaType(uischema, 'TransformedTable');
  const sourceEnum = generateEnum(source);
  const targetEnum = generateEnum(target);

  const schema = {
    type: 'object',
    properties: {
      [objectMapKey]: {
        type: 'array',
        items: {
          type: 'object',
          required: ['target'],
          properties: {
            source: {
              type: 'object',
              title: source?.title,
              enum: [{ value: 'Clear Property', type: 'clearable' }, ...sourceEnum],
            },
            target: {
              type: 'object',
              title: target?.title,
              enum: targetEnum,
            },
          },
        },
      },
      ...(sourceTableKey && { [sourceTableKey]: { type: 'object' } }),
      ...(TransformedTableKey && { [TransformedTableKey]: { type: 'object' } }),
    },
  };

  return {
    schema: schema,
    data: {
      [objectMapKey]: targetEnum.map((target: any) => ({ target })),
      [sourceTableKey]: dataToTransform,
      [TransformedTableKey]: dataToTransform,
      baseKeys: {
        objectMapKey,
        sourceTableKey,
        TransformedTableKey,
      },
    },
  };
};

export const createRecipe = (data: any) => {
  if (!data.baseKeys.objectMapKey) {
    return;
  }

  return data?.[data.baseKeys.objectMapKey]?.reduce(
    //@ts-ignore
    (acc, { source, target }) => {
      if (!source?.value) {
        return acc;
      }

      acc[target.value] = source.value;

      return acc;
    },
    {}
  );
};

export const transformData = (data: any, sourceData: any) => {
  try {
    const recipe = createRecipe(data);
    const transformedData = Object.keys(recipe || []).reduce((acc: any, curr) => {
      const sourceKey = recipe[curr];
      const sourceValue = dot.pick(sourceKey, sourceData);
      acc[curr] = sourceValue;
      return dot.object(acc);
    }, {});

    return transformedData;
  } catch (e) {
    console.error(e);
  }
};
