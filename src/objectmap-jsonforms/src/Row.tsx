import React, { useState } from 'react';
import { FormControl, InputLabel, MenuItem, Select, TextField } from '@material-ui/core';

interface Enum {
  value: string;
  label?: string;
  type: string;
}

interface Props {
  target: Enum;
  sourceEnum: Enum[];
  onChange: (source: string, target: Enum) => void;
}

const Row = ({ target, sourceEnum, onChange }: Props) => {
  const [targetValue, setTargetValue] = useState<string>('');

  return (
    <div style={{ display: 'flex', marginBottom: '20px' }}>
      <TextField
        label={target?.label || target.value}
        aria-readonly="true"
        disabled
        style={{
          marginRight: '40px',
          width: '100%',
          border: 'none',
        }}
      />
      <FormControl style={{ width: '100%' }}>
        <InputLabel>Select a Property</InputLabel>
        <Select
          label="Select a Property"
          value={targetValue}
          onChange={(e: any) => {
            const source = sourceEnum.find((val) => val.value === e.target.value);

            if (!source) {
              return;
            }

            if (source.type === 'clearable') {
              setTargetValue('');
              onChange(target?.value || '', source);
            } else {
              setTargetValue(e.target.value);
              onChange(target?.value || '', source);
            }
          }}
        >
          {sourceEnum.map((e) => (
            <MenuItem key={e.value} value={e.value}>
              {e?.label || e.value}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default Row;
