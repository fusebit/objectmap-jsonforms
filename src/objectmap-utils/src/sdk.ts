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

const generateEnum = (schema: { [key: string]: any }) => {
  const schemaEnum: { [key: string]: any }[] = [];

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

export const getKeyByUiSchemaType = (uischema: { [key: string]: any }, type: string) => {
  let objectKey = '';

  Object.keys(dot.dot(uischema)).forEach((element) => {
    if (element.includes('type') && dot.pick(element, uischema) === type) {
      const scopePicker = element.replace('type', 'scope');
      const scope = dot.pick(scopePicker, uischema);
      const splittedScope = scope.split('/');
      const key: string = splittedScope[splittedScope.length - 1];
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
  source: { [key: string]: any };
  target: { [key: string]: any };
  uischema: { [key: string]: any };
  dataToTransform: { [key: string]: any };
}) => {
  const objectMapKey = getKeyByUiSchemaType(uischema, 'ObjectMap');
  const sourceTableKey = getKeyByUiSchemaType(uischema, 'SourceTable');
  const TransformedTableKey = getKeyByUiSchemaType(uischema, 'TransformedTable');
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
              enum: [{ value: '(Do Not Map)', type: 'clearable' }, ...sourceEnum],
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
      [objectMapKey]: targetEnum.map((target: { [key: string]: any }) => ({ target })),
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

export const createRecipe = (data: { [key: string]: any }) => {
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

export const transformData = (data: { [key: string]: any }, sourceData: { [key: string]: any }[]) => {
  try {
    const recipe = createRecipe(data);
    const transformations = sourceData.map((source) => {
      const transformedData = Object.keys(recipe || []).reduce((acc: { [key: string]: any }, curr) => {
        const sourceKey = recipe[curr];
        const sourceValue = dot.pick(sourceKey, source);
        acc[curr] = sourceValue;
        return dot.object(acc);
      }, {});

      return transformedData;
    });

    return transformations;
  } catch (e) {
    console.error(e);
  }
};
