// YOU CAN NAME IT auth.js
import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";

import Input from "../../components/UI/Input/Input";
import Button from "../../components/UI/Button/Button";
import Spinner from "../../components/UI/Spinner/Spinner";

import classes from "./Authentication.css";

import * as actionTypes from "../../store/actions/index";

const authentication = (props) => {
  const [authForm, setAuthForm] = useState({
    email: {
      elementType: "input",
      elementConfig: {
        type: "email",
        placeholder: "Mail Address",
      },
      value: "",
      validation: {
        required: true,
        isEmail: true,
      },
      valid: false,
      touched: false,
    },
    password: {
      elementType: "input",
      elementConfig: {
        type: "password",
        placeholder: "Password",
      },
      value: "",
      validation: {
        required: true,
        minLength: 6,
      },
      valid: false,
      touched: false,
    },
  });
  const [isSignup, setIsSignup] = useState(false);

  useEffect(() => {
    if (!props.buildingBurger && props.authRedirectPath !== "/") {
      props.onSetAuthRedirectPath();
    }
  }, []);

  // ABOUT VALIDATION:
  // https://react.rocks/tag/Validation
  const checkValidity = (value, rules) => {
    let isValid = true;
    if (!rules) {
      return true;
    }

    if (rules.required) {
      isValid = value.trim() !== "" && isValid;
    }

    if (rules.minLength) {
      isValid = value.length >= rules.minLength && isValid;
    }

    if (rules.maxLength) {
      isValid = value.length <= rules.maxLength && isValid;
    }

    if (rules.isEmail) {
      const pattern = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
      isValid = pattern.test(value) && isValid;
    }

    if (rules.isNumeric) {
      const pattern = /^\d+$/;
      isValid = pattern.test(value) && isValid;
    }

    return isValid;
  };

  const inputChangedHandler = (event, controlName) => {
    const updatedControls = {
      ...authForm,
      [controlName]: {
        ...authForm[controlName],
        value: event.target.value,
        valid: checkValidity(
          event.target.value,
          authForm[controlName].validation
        ),
        touched: true,
      },
    };
    setAuthForm(updatedControls);
  };

  const submitHandler = (event) => {
    event.preventDefault();
    props.onAuthentication(
      authForm.email.value,
      authForm.password.value,
      isSignup
    );
  };

  const switchAuthModeHandler = () => {
    setIsSignup(!isSignup);
  };

  const formElementsArray = [];
  for (let key in authForm) {
    formElementsArray.push({
      id: key,
      config: authForm[key],
    });
  }

  let form = formElementsArray.map((formElement) => (
    <Input
      key={formElement.id}
      elementType={formElement.config.elementType}
      elementConfig={formElement.config.elementConfig}
      value={formElement.config.value}
      invalid={!formElement.config.valid}
      shouldValidate={formElement.config.validation}
      touched={formElement.config.touched}
      changed={(event) => inputChangedHandler(event, formElement.id)}
    />
  ));

  if (props.loading) {
    form = <Spinner />;
  }

  let errorMessage = null;
  if (props.error) {
    // From Firebase: res.data.error.message
    errorMessage = <p>{props.error.message}</p>;
  }

  let authRedirect = null;
  if (props.isAuthenticated) {
    authRedirect = <Redirect to={props.authRedirectPath} />;
  }

  return (
    <div className={classes.Auth}>
      {authRedirect}
      {errorMessage}
      {form}
      <form onSubmit={submitHandler}>
        <Button btnType="Success">SUBMIT</Button>
      </form>
      <Button clicked={switchAuthModeHandler} btnType="Danger">
        SWITCH TO {isSignup ? "SIGNIN" : "SIGNUP"}
      </Button>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    loading: state.auth.loading,
    error: state.auth.error,
    isAuthenticated: state.auth.token !== null,
    buildingBurger: state.burgerBuilder.building,
    authRedirectPath: state.auth.authRedirectPath,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onAuthentication: (email, password, isSignup) =>
      dispatch(actionTypes.authentication(email, password, isSignup)),
    onSetAuthRedirectPath: () => dispatch(actionTypes.setAuthRedirectPath("/")),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(authentication);
