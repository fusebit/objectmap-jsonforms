import React, { useMemo } from 'react';
import { useJsonForms, withJsonFormsControlProps } from '@jsonforms/react';
import { rankWith, ControlProps, and, uiTypeIs } from '@jsonforms/core';
import { Table, TableBody, TableCell, TableRow, TableHead, TableContainer, Paper, Typography } from '@material-ui/core';
import { objectMap } from '@fusebit/objectmap-utils';
import dot from 'dot-object';

const TransformedTableVanillaRenderer = ({ data }: ControlProps) => {
  const ctx = useJsonForms();

  const tranformedTable: { [key: string]: any } = useMemo(() => {
    const transformedData = objectMap.transformData(ctx.core.data, [dot.object(data)])?.[0];
    return dot.dot(transformedData) || [];
  }, [ctx.core.data, data]);

  return (
    <div>
      {Object.keys(tranformedTable || []).length > 0 && (
        <>
          <Typography variant="h5" style={{ width: 'max-content', margin: '16px 0' }}>
            Transformed Data
          </Typography>
          <TableContainer component={Paper} style={{ marginBottom: '16px' }}>
            <Table>
              <TableHead>
                <TableRow>
                  {Object.keys(tranformedTable).map((val) => (
                    <TableCell key={val}>{val}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  {Object.keys(tranformedTable).map((val) => (
                    <TableCell key={val}>{JSON.stringify(tranformedTable?.[val])}</TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </div>
  );
};

const TransformedTableTester = rankWith(3, and(uiTypeIs('TransformedTable')));
const TransformedTableRenderer = withJsonFormsControlProps(TransformedTableVanillaRenderer);

const TransformedTableControl = {
  tester: TransformedTableTester,
  renderer: TransformedTableRenderer,
};

export { TransformedTableControl, TransformedTableTester, TransformedTableRenderer };

export default TransformedTableControl;
