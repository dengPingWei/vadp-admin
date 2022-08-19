/**
 * Created by huangzhangshu on 2018/4/24
 */
import {Select, Input, Checkbox, AutoComplete, Radio, Button, Tooltip} from '@vadp/ui';
import InputType from './InputType';
import styles from './FormUtil.less';

const {Option} = Select;
const {TextArea} = Input;
const CheckboxGroup = Checkbox.Group;
const AutoCompleteOption = AutoComplete.Option;
const RadioGroup = Radio.Group;

function initialCallback(field, value) {
  console.log('you did not pass callback by '.concat(field));
}

export function switchItem(item, callback = initialCallback) {
  const {type, options, disabled, required, nameField, valueField, field, maxlength, style, autosize, selectScroll, selectSearch, onSelect} = item;
  switch (type) {
    case InputType.int: {
      const maxLength = maxlength || '255';
      return <Input
        key={`formInput${field}`}
        disabled={disabled}
        // type="tel"
        autoComplete="off"
        maxLength={maxLength}
        style={style || {}}
        onChange={(value) => callback(field, value)}/>;
    }
    case InputType.email: {
      const maxLength = maxlength || '255';
      return <Input
        key={`formInput${field}`}
        disabled={disabled}
        // type="email"
        autoComplete="off"
        maxLength={maxLength}
        onChange={(value) => callback(field, value)}/>;
    }
    case InputType.input: {
      const maxLength = maxlength || '255';
      return <Input
        key={`formInput${field}`}
        disabled={disabled}
        type="text"
        autoComplete="off"
        maxLength={maxLength}
        onChange={(e) => callback(field, e.target.value)}/>;
    }
    case InputType.textarea: {
      const maxLength = maxlength || '255';
      return <TextArea
        key={`formArea${field}`}
        disabled={disabled}
        autoComplete="off"
        maxLength={maxLength}
        autosize={autosize || {minRows: 2, maxRows: 6}}
        onChange={(e) => callback(field, e.target.value)}/>;
    }
    case InputType.autocomplete: {
      const maxLength = maxlength || '255';
      return (
        <AutoComplete
          key={`formAutoComplete${field}`}
          disabled={disabled}
          onSelect={(value) => callback(field, value)}
          maxLength={maxLength}
          dataSource={
            options && options.map((option, index) => {
              return (<AutoCompleteOption
                key={index} value={option.id}>{option.name}</AutoCompleteOption>);
            })
          }>
          <Input/>
        </AutoComplete>
      );
    }
    case InputType.checkbox: {
      return <CheckboxGroup
        key={`formGroup${field}`}
        disabled={disabled}
        options={options}
        style={{display: 'flex', alignItems: 'center', height: '32px'}}/>;
    }
    case InputType.radio: {
      const radioOptions = options ? [...options] : [];
      for (const option of radioOptions) {
        option.label = option.codeName;
        option.value = option.codeValue;
      }
      return (
        <RadioGroup
          key={`formRadio${field}`}
          disabled={disabled}
          options={radioOptions}
          onChange={(e) => callback(field, e.target.value)}/>
      );
    }
    case InputType.select: {
      let dataSource = [];
      if (options) {
        dataSource = required ? [...options] : [{name: '', value: ''}, ...options];
      }
      return (
        <Select
          showSearch
          onSelect={onSelect}
          onSearch={selectSearch}
          onPopupScroll={selectScroll}
          filterOption={(input, option) => {
            let {children, value, spell = ''} = option.props;
            if (typeof children !== 'string') {
              children = children.props.title;
            }
            if (children && value && input &&  typeof children === 'string') {
              return children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                || value.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  || (spell || '').toLowerCase().indexOf(input.toLowerCase()) >= 0;
            }
          }}
          disabled={disabled}
          onChange={(value) => callback(field, value)}
          key={`formSelect${field}`}
          style={style || {}}>
          {
            dataSource.map((option, index) => {
              const name = option[nameField] || '';
              const value = option[valueField];
              const {spell = ''} = option;
              const optionStyle = (!required && !value) ? {height: 30} : {};
              if ((name.length) * 16 > 200) {
                return (<Option key={`${field}${value}${index}`} value={value} spell={spell} style={optionStyle}>
                  <Tooltip title={name} placement="right"><span className={styles.formSelectEllipsis}
                                              style={{maxWidth: 200}}>{name}</span></Tooltip>
                </Option>);
              }
              return (<Option key={`${field}${value}${index}`} value={value} spell={spell} style={optionStyle}>{name}</Option>);
            })
          }
        </Select>
      );
    }
    case InputType.search: {
      return (
        <div key={`formDiv${field}`} className={styles.search}>
          <Button type="primary" onClick={() => callback(field)} className={styles.btn}>查询</Button>
        </div>
      );
    }
    default: {
      return <Input
        key={`formInput${field}`}
        disabled={disabled}
        onChange={(e) => callback(field, e.target.value)}/>;
    }
  }
}

export function warpFormForUnit(formData = []) {
  const result = [];
  let temporary = [];
  let span = 0;
  const spanCount = 24;
  for (const form of formData) {
    temporary.push(form);
    span += form.span || 0;
    if (span >= spanCount) {
      result.push(temporary);
      temporary = [];
      span = 0;
    }
  }
  if (temporary.length > 0) result.push(temporary);
  return result;
}

export function warpFormForSearch(formData = []) {
  const result = [];
  let temporary = [];
  let isLoadSearch = false;
  const ROW_SIZE = 3;
  for (const form of formData) {
    temporary.push(form);
    if (form.field === InputType.search) isLoadSearch = true;
    if (isLoadSearch && temporary.length >= ROW_SIZE) {
      result.push(temporary);
      temporary = [];
    }
  }
  if (temporary.length > 0) result.push(temporary);
  return result;
}
