import React, { Component } from "react";
import { ActivityIndicator, TextInput, View, Text } from "react-native";
import RNApp from "./RNApp";
import { ApolloProvider, Query } from "react-apollo";

import ApolloClient from "apollo-boost";
import gql from "graphql-tag";

const client = new ApolloClient({ uri: 'http://10.0.2.2:5000/graphql' });

export default class App extends Component {

  render() {
    return (
      <ApolloProvider client={client}>
      <RNApp/>
      </ApolloProvider>
    );
  }
}