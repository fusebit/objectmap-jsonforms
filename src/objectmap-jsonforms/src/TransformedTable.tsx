import React, { useMemo } from 'react';
import { useJsonForms, withJsonFormsControlProps } from '@jsonforms/react';
import { rankWith, ControlProps, and, uiTypeIs } from '@jsonforms/core';
import { Table, TableBody, TableCell, TableRow, TableHead, TableContainer, Paper, Typography } from '@material-ui/core';
import { objectMap } from '@fusebit/objectmap-utils';
import dot from 'dot-object';
import { AnyObject } from './types';

const TransformedTableVanillaRenderer = ({ data }: ControlProps) => {
  const ctx = useJsonForms();

  const tranformedTable: AnyObject = useMemo(() => {
    const sourceData = [dot.object(data)];
    const transformedDataArray = objectMap.transformData(ctx.core.data, sourceData);
    const transformedDataObject = transformedDataArray?.[0] || {};
    return dot.dot(transformedDataObject) || [];
  }, [ctx.core.data, data]);

  const renderTable = Object.keys(data).length > 0;

  return renderTable ? (
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
  ) : null;
};

const TransformedTableTester = rankWith(3, and(uiTypeIs('TransformedTable')));
const TransformedTableRenderer = withJsonFormsControlProps(TransformedTableVanillaRenderer);

const TransformedTableControl = {
  tester: TransformedTableTester,
  renderer: TransformedTableRenderer,
};

export { TransformedTableControl, TransformedTableTester, TransformedTableRenderer };

export default TransformedTableControl;
