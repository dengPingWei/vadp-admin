import React, {Component, PureComponent} from 'react';
import {connect} from 'react-redux';
import {Input, Checkbox, Tabs, Form, Select, Table, InputNumber, DatePicker} from '@vadp/ui';
import TableTitle from '../../components/TableTitle';
import './orginzation.less';

const {TabPane} = Tabs;

const EditableContext = React.createContext();

class EditableCell extends Component {

  getInput = () => {
    const {enums = [], updateFunctionData, dataIndex, dataCode} = this.props;
    return (
      <Select
        dropdownClassName="domain-orginzation-select"
        style={{maxWidth: 715}}
        showSearch
        filterOption={(input, option) => option.props.children && option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        onChange={(value) => {
          updateFunctionData({paramValue: value, paramCode: dataIndex, functionCode: dataCode});
        }}>
        {enums.map((item) => {
          const {label, value} = item;
          return <Select.Option key={value} value={String(value)}>{label}</Select.Option>;
        })}
      </Select>
    );
  };

  renderCell = ({getFieldDecorator}) => {
    const {
      editing,
      dataIndex,
      dataIndexId,
      dataCode,
      title,
      titleText,
      inputType,
      index,
      children,
      paramValue,
      ...restProps
    } = this.props;
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item style={{margin: 0}}>
            {getFieldDecorator(`${dataCode}_${dataIndex}`, {
              initialValue: paramValue,
            })(this.getInput())}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  render() {
    return <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>;
  }
}

class OrganizationType extends PureComponent {
  constructor(props) {
    super(props);
    this.newTabIndex = 0;
    this.state = {
      activeKey: '',
      panes: [],
      functionData: {},
    };
  }

  componentDidMount() {
    const {editList: {paramlist = [], unitmenu = []}, GetChildData, updateFunctionData, menuList = []} = this.props;
    let activeKey = '';
    const containerCode = {};
    for (const param of paramlist) {
      containerCode[param.functionCode] = true;
      param.key = param.functionCode;
      param.code = param.functionCode;
      param.title = this.getTitle(param.functionCode);
      if (!activeKey) activeKey = param.functionCode;
      updateFunctionData(param);
    }
    for (const index in unitmenu) {
      if (unitmenu[index]) {
        const {code} = menuList[index];
        if (!containerCode[code]) {
          paramlist.push({
            functionCode: code,
            key: code,
            title: this.getTitle(code),
          });
          if (!activeKey) activeKey = code;
          containerCode[code] = true;
        }
      }
    }
    GetChildData(paramlist);
    this.setState({activeKey, panes: paramlist});
  }

  getTitle = (checkedValue) => {
    const {menuList} = this.props;
    let title = '';
    for (const menu of menuList) {
      if (menu.code === checkedValue) title = menu.name;
    }
    return title;
  }

  add = (checkedValues) => {
    const {GetChildData} = this.props;
    const panes = checkedValues.map((checkedValue) => {
      return {
        title: this.getTitle(checkedValue),
        key: checkedValue,
        activeKey: checkedValue,
        code: checkedValue,
      };
    });
    if (checkedValues.length !== 0) {
      this.setState({activeKey: checkedValues[checkedValues.length - 1]});
    }
    this.setState({panes});
    GetChildData(panes);
  };

  onChange = (activeKey) => {
    this.setState({activeKey});
  };

  hasProperties = (code) => {
    const {functionGroups} = this.props;
    for (const group of functionGroups) {
      const {functionCode} = group;
      if (code === functionCode) return true;
    }
    return false;
  }


  // 获取表格列
  getColumns = (code) => {
    const {functionGroups} = this.props;
    const columns = [];
    for (const group of functionGroups) {
      const {functionCode, schema: {type, properties = []}} = group;
      if (functionCode === code) {
        for (const columnsItem of properties) {
          const colInnerWidth = (window.innerWidth - 700) / properties.length;
          const {name, value: {enums, type: itemType, title, required}} = columnsItem;
          columns.push({
            title: <TableTitle title={title} required={required}/>,
            titleText: title,
            dataIndex: name,
            dataCode: code,
            editable: true,
            ellipsis: true,
            enums,
            width: Math.max(Math.ceil(colInnerWidth), 200),
            render: (item = {}) => {
              return <span>{item ? item.name : ''}</span>;
            },
          });
        }
      }
    }
    return columns;
  }

  getEditColumns = (code) => {
    const {form: {setFieldsValue, getFieldsValue}, updateFunctionData, editList: {paramlist = []}} = this.props;
    const initialColumns = this.getColumns(code);
    return initialColumns.map((col) => {
      if (!col.editable) {
        return col;
      }
      let paramValue = '';
      for (const param of paramlist) {
        if (param.functionCode === col.dataCode && param.paramCode === col.dataIndex) {
          // eslint-disable-next-line prefer-destructuring
          paramValue = param.paramValue;
        }
      }
      return {
        ...col,
        onCell: record => ({
          getFieldsValue,
          setFieldsValue,
          record,
          inputType: 'select',
          dataIndex: col.dataIndex,
          dataIndexId: col.dataIndexId,
          title: col.title,
          titleText: col.titleText,
          list: col.list,
          enums: col.enums,
          dataCode: col.dataCode,
          editing: true,
          paramValue,
          updateFunctionData,
        }),
      };
    });
  }

  switchItem(pane) {
    const type = pane.key;
    switch (type) {
      case 0:
        return <TabPane tab={pane.title} key={pane.key}><InputNumber style={{width: '30%'}}/> </TabPane>;
      case 1:
        return <TabPane tab={pane.title} key={pane.key}><Input style={{width: '30%'}} placeholder='1'/></TabPane>;
      case 2:
        return <TabPane tab={pane.title} key={pane.key}><DatePicker style={{width: '50%'}}/></TabPane>;
      default:
        return <TabPane tab={pane.title} key={pane.key}><Input style={{width: '30%'}} placeholder='其他'/></TabPane>;
    }
  }

  render() {
    const {menuList, editList, form} = this.props;
    const {activeKey, functionData} = this.state;
    const {panes} = this.state;
    const {unitmenu = []} = editList;
    const options = [];
    const defaultCheckBoxValues = [];
    for (let i = 0; i < menuList.length; i++) {
      if (unitmenu.length - 1 >= i && unitmenu[i]) defaultCheckBoxValues.push(menuList[i].code);
      options.push({label: menuList[i].name, value: menuList[i].code});
    }
    const defaultValueArr = [];
    const panelmenu = editList.panelmenu || [];
    if (panelmenu.length !== 0) {
      for (let i = 0; i < panelmenu.length; i++) {
        defaultValueArr.push(
          panelmenu[i].label,
        );
      }
    }
    const components = {
      body: {
        cell: EditableCell,
      },
    };
    // eslint-disable-next-line no-undef
    const isIE = app.isIE();  // app.isIE()
    const scroll = isIE ? {} : {x: true, y: window.innerHeight - 500};
    return (
      <div>
        <Checkbox.Group options={options} defaultValue={defaultCheckBoxValues} onChange={this.add}/>
        <Tabs onChange={this.onChange} activeKey={activeKey}>
          {panes.map((pane) => {
            const dataSource = functionData[pane.code || pane.functionCode];
            const columns = this.getEditColumns(pane.code || pane.functionCode);
            return (
              <TabPane tab={pane.title} key={pane.key}>
                <EditableContext.Provider value={form}>
                  {columns.length !== 0 && <Table
                    style={{maxWidth: 740}}
                    bordered
                    pagination={false}
                    defaultCurrent={1}
                    rowKey={record => record.id}
                    scroll={scroll}
                    components={components}
                    columns={columns}
                    dataSource={dataSource || [{}]}/>}
                </EditableContext.Provider>
              </TabPane>);
          })}
        </Tabs>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  functionGroups: state.adminDomain.functionGroups,
});

export default Form.create()(connect(mapStateToProps)(OrganizationType));
