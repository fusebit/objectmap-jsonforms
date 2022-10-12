import React, { useMemo } from 'react';
import { withJsonFormsControlProps } from '@jsonforms/react';
import { rankWith, ControlProps, and, uiTypeIs } from '@jsonforms/core';
import { Table, TableBody, TableCell, TableRow, TableHead, TableContainer, Paper, Typography } from '@material-ui/core';
import dot from 'dot-object';

const SourceTableVanillaRenderer = ({ data }: ControlProps) => {
  const baseTable = useMemo(() => {
    return dot.dot(data);
  }, [data]);

  return (
    <div>
      <Typography variant="h5" style={{ width: 'max-content', margin: '16px 0' }}>
        Source Data
      </Typography>
      <TableContainer component={Paper} style={{ marginBottom: '16px' }}>
        <Table>
          <TableHead>
            <TableRow>
              {Object.keys(baseTable).map((val) => (
                <TableCell key={val}>{val}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              {Object.keys(baseTable).map((val) => (
                <TableCell key={val}>{dot.pick(val, data)}</TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

const SourceTableTester = rankWith(3, and(uiTypeIs('SourceTable')));
const SourceTableRenderer = withJsonFormsControlProps(SourceTableVanillaRenderer);

const SourceTableControl = {
  tester: SourceTableTester,
  renderer: SourceTableRenderer,
};

export { SourceTableControl, SourceTableTester, SourceTableRenderer };

export default SourceTableControl;
