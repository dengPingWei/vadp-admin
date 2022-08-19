import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Layout, Select, Title} from '@vadp/ui';

import ListView from './components/ListView';
import EditForm from './components/EditForm';
import MenuModal from './components/MenuModal';
import actions from '../../shared/actions'

const {Option} = Select;


const {Sider, Content} = Layout;

class MenuPage extends PureComponent {

  constructor(props) {
    super(props);
    this.animation = {right: '0px', duration: 1000};
    this.state = {
      checkedKeys: [],
      loading: false,
    };
    const { dispatch } = props
    dispatch({type: 'user/update', payload: { ...actions.actions.user }});
    dispatch({type: 'global/update', payload: { ...actions.actions.global }});
	
  }

  componentDidMount() {
    const {dispatch, currentApp, currentItem, menuCurrentApp} = this.props;
    dispatch({type: 'adminMenu/updateMenuCurrentApp', payload: menuCurrentApp.id ? menuCurrentApp : currentApp});
    dispatch({type: 'adminMenu/fetchApps'});
    dispatch({type: 'adminMenu/fetchMenu'});
    const {id} = currentItem;
    if (id) {
      dispatch({type: 'adminMenu/fetchButtons', payload: {newMenuId: id}});
      dispatch({type: 'adminMenu/fetchDefinedButtons', payload: {newMenuId: id}});
    }
  }

  componentWillUnmount() {
    const {dispatch} = this.props;
    dispatch({type: 'adminMenu/resetState'});
  }

  onDelete = () => {
    const {checkedKeys} = this.state;
    if (checkedKeys.length > 0) {
      this.props.dispatch({type: 'adminMenu/menu', payload: checkedKeys}
      )
      this.setState({checkedKeys: []});
    }
  };


  onSelectChange = (selectedRowKeys) => {
    this.setState({selectedRowKeys});
  };

  onCheck = (checkedKeys) => {
    this.setState({checkedKeys});
  };

  handleAdd = () => {
    this.props.dispatch({type: 'adminMenu/showModal', payload: {modalType: 'create', currentItem: {}}});
  }

  handleAddChild = () => {
    const {dispatch, menu: {modalType, currentItem}} = this.props;
    const item = {
      id: "",
      name: "",
      parentId: currentItem.id,
      remark: "",
    };
    this.props.dispatch({type: 'adminMenu/showModal', payload: {modalType: 'createChild', currentItem: item}})
  };

  handleSelect = (selectedKey) => {
    const {dispatch, menu} = this.props;
    const record = menu.content.filter(item => item.id === selectedKey)[0];
    if (record) {
      dispatch({type: 'adminMenu/showModal', payload: {modalType: 'update', currentItem: record}});
      dispatch({type: 'adminMenu/updateState', payload: {buttons: [], buttonValues: []}});
      dispatch({type: 'adminMenu/fetchButtons', payload: {newMenuId: record.id}});
      dispatch({type: 'adminMenu/fetchDefinedButtons', payload: {newMenuId: record.id}});
      if (this.editForm && this.editForm.resetFields) {
        this.editForm.resetFields();
      }
    }
  };

  handleAppChange = (id) => {
    const {dispatch, apps} = this.props;
    for (const app of apps) {
      if (app.id === id) {
        dispatch({type: 'adminMenu/updateMenuCurrentApp', payload: app});
        dispatch({type: 'adminMenu/fetchMenu'});
      }
    }
  }

  renderAppOptions = () => {
    const {apps} = this.props;
    return apps.map((app, index) => {
      return <Option value={app.id} key={`${app.id}${index}`}>{app.name}</Option>;
    });
  }

  render() {
    const {
      dispatch, theme, menu: {modalType, modalVisible, currentItem, content, menuCurrentApp},
    } = this.props;

    const modalProps = {
      item: modalType === 'create'
        ? {}
        : currentItem,
      type: modalType,
      visible: modalVisible,
      onOk: (values) => {
        dispatch({type: 'adminMenu/update', payload: {modalType, item: values}});
        dispatch({type: 'adminMenu/showModal', payload: {modalType, currentItem: values}});
      },
      onCancel: () => {
        dispatch({type: 'adminMenu/hideModal', payload: modalType});
      },
    };
    const {checkedKeys} = this.state;
    const hasSelected = checkedKeys.length > 0;
    const menuSider = theme === 'dark' ? 'menu-sider-dark' : 'menu-sider-light';
    return (
      <div className="animated fadeIn">
        <Layout style={{backgroundColor: theme === 'dark' ? 'transparent' : 'white'}}>
          <Sider
            width={280}
            className={menuSider}
            style={{
              background: theme === 'dark' ? 'transparent' : 'white',
            }}>
            <Title text="导航菜单"/>
            <Select
              value={menuCurrentApp.id}
              onChange={this.handleAppChange}
              size="default"
              style={{width: '100%', paddingRight: 20, marginBottom: 9, marginTop: 16}}>
              {this.renderAppOptions()}
            </Select>
            <ListView
              style={{marginTop: 16}}
              data={content}
              onSelect={this.handleSelect}
              onCheck={this.onCheck}
              checkedKeys={this.state.checkedKeys}
            />
          </Sider>
          <Content>
            <EditForm {...modalProps} ref={(form) => this.editForm = form}/>
          </Content>
        </Layout>
        <MenuModal />
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  auth: state.user,
  menu: state.adminMenu,
  domain: state.adminDomain,
  theme: state.global.theme,
  currentApp: state.global.currentApp,
  apps: state.adminMenu.apps,
  menuCurrentApp: state.adminMenu.menuCurrentApp,
  currentItem: state.adminMenu.currentItem,
});
export default connect(mapStateToProps)(MenuPage);
