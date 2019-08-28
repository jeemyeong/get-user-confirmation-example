import React, { Reducer, useEffect } from 'react';
import './App.css';
import { Provider, useDispatch } from "react-redux";
import { createStore, combineReducers, Store } from 'redux';
import { Switch, Route, BrowserRouter, Link, Prompt } from 'react-router-dom';


const PREVENT_LEAVE = "prevent/PREVENT_LEAVE";
const ALLOW_LEAVE = "prevent/ALLOW_LEAVE";

export type PreventLeaveMessage<T> = T | null;
const preventLeave = <T extends {}>(preventLeaveMessage: PreventLeaveMessage<T>) => {
  return {
    type: PREVENT_LEAVE,
    payload: {
      preventLeaveMessage
    }
  } as const
};

const allowLeave = () => {
  return {
    type: ALLOW_LEAVE
  } as const
};

const initialState = null;

export type PreventLeaveAction =
    ReturnType<typeof preventLeave>
  | ReturnType<typeof allowLeave>


const preventLeaveReducer: Reducer<any, PreventLeaveAction> =(preventLeaveMessage: PreventLeaveMessage<any> = initialState, action: PreventLeaveAction) => {
  switch (action.type) {
    case PREVENT_LEAVE: {
      const {
        preventLeaveMessage
      } = action.payload;
      return preventLeaveMessage
    }
    case ALLOW_LEAVE: {
      return null
    }
  }
  return preventLeaveMessage
};

const rootReducer = combineReducers({
  preventLeave: preventLeaveReducer
});

type IRootState = ReturnType<typeof rootReducer>;

const store = createStore(rootReducer);
(window as any).store = store;

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <BrowserRouter
        getUserConfirmation={getUserConfirmation(store)}
      >
        <>
          <Nav/>
          <Switch>
            <Route
              path={"/"}
              exact={true}
              render={() => {
                return <Home/>
              }}
            />
            <Route
              path={"/hello"}
              exact={true}
              render={() => {
                return <Hello/>
              }}
            />
            <Route
              path={"/world"}
              exact={true}
              render={() => {
                return <World/>
              }}
            />
          </Switch>
        </>
        <Prompt
          message={" "}
        />
      </BrowserRouter>
    </Provider>
  );
};

const usePreventLeave = (preventLeaveMessage: string, deps: any[] = []) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(preventLeave(preventLeaveMessage));
    const listener = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", listener);
    return () => {
      dispatch(allowLeave());
      window.removeEventListener("beforeunload", listener);
    }
  }, deps);
};

const Nav = () => {
  return (
    <nav>
      <Link to={"/"}>Home</Link>
      <Link to={"/hello"}>Hello</Link>
      <Link to={"/world"}>World</Link>
    </nav>
  )
};

const Home = () => {
  return (
    <div>Home</div>
  )
};

const Hello: React.FC = () => {
  usePreventLeave("Bye");
  return (
    <div>Hello</div>
  )
};

const World: React.FC = () => {
  usePreventLeave("See you");
  return (
    <div>World</div>
  )
};

export const getUserConfirmation = (store: Store<IRootState>) => (_: unknown, callback: (ok: boolean) => void) => {
  const {
    preventLeave
  } = store.getState();

  if (!preventLeave) {
    return callback(true)
  }

  if (window.confirm(preventLeave)) {
    callback(true)
  } else {
    callback(false)
  }
};


export default App;
