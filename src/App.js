import React, { Suspense, useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import {getNavData} from './common/nav';
// import { UserPage } from './routes'

const BASE_NAME = window.__POWERED_BY_QIANKUN__ ? "/admin" : "";
const App = () => {
  // 设置路由命名空间
  return (
    <Router basename={BASE_NAME}>
      <Suspense fallback={null}>
        <Switch>
          {/* <Route path="/" component={ UserPage }>
            <Route path='users' component={ UserPage }></Route>
          </Route> */}
          {
            getNavData().map((mitem) => {
              return <Route path={mitem.path} key={mitem.path} exact component={mitem.component}></Route>
            })
          }
        </Switch>
      </Suspense>
    </Router>
  );
};

export default App;
