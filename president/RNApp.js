import React, { Component } from 'react'
import { TouchableHighlight, View, Text, TextInput, StyleSheet, Button } from 'react-native'

import { ApolloProvider, graphql, Mutation } from 'react-apollo';
import gql from 'graphql-tag'

export default class RNApp extends Component {
  constructor(){
    super()
    this.state = {name: '', phone: ''};
  }

  render () {
    const addCustomer = gql`
      mutation issueAdd($issue: IssueInputs!) {
        issueAdd(issue: $issue) {
          id
        }
      }`;


    return (
        <View style={styles.container}>
          <Text style={{textAlign:'center',color:'black',fontWeight:'bold'}}>Hotel Waitlist</Text>
          <Mutation mutation={addCustomer}>
            {(addIssueMutation, { data }) => (
              <View>
                <Text style={{color: 'black'}}>Add Customer</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={text => this.setState({ name: text })}
                  value={this.state.name}
                  placeholder="Name"
                />
                <TextInput
                  style={styles.input}
                  onChangeText={text => this.setState({ phone: text })}
                  value={this.state.phone}
                  placeholder="Phone number"
                />
                <Button
                  onPress={() => {
                    addIssueMutation({
                      variables: {
                        issue: this.state
                      }
                    })
                      .then(res => res)
                      .catch(err => <Text>{err}</Text>);
                    this.setState({ name: '', phone: '' });
                  }}
                  title="Submit"
                />
              </View>
            )}
          </Mutation>
        </View>
    )
  }
}

styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    backgroundColor: '#dddddd',
    height: 50,
    margin: 20,
    marginBottom: 0,
    paddingLeft: 10
  }
})
