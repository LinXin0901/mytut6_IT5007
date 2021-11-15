const initialIssues = [
  {
    id: 1, name: 'Anna', phone: '84566920',
    timestamp: new Date('2018-08-15T20:59:09'),
  },
  {
    id: 2, name: 'Bob', phone: '23658237', 
    timestamp: new Date('2018-08-15T21:01:45'),
  },
  {
    id: 3, name: 'Cindy', phone: '94672587',  
    timestamp: new Date('2018-08-15T21:31:32'),
  }
];

var original_id = 4;

const dateRegex = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d');

function jsonDateReviver(key, value) {
  if (dateRegex.test(value)) return new Date(value);
  return value;
}

class DisplayFreeSlots extends React.Component {
  render() {
    const slots = 25 - this.props.freeSlots;

    return (
      <div id="freeslots">Free slots in the waitlist:{slots}</div>
    );
  }
}

class IssueRow extends React.Component {
  render() {
    const issue = this.props.issue;
    return (
      <tr>
        <td>{issue.id}</td>
        <td>{issue.name}</td>
        <td>{issue.phone}</td>
        <td>{issue.timestamp.toTimeString()}</td>
      </tr>
    );
  }
}

class DisplayCustomer extends React.Component {
  render() {
    const issueRows = this.props.issues.map(issue =>
      <IssueRow key={issue.id} issue={issue} />
    );

    return (
      <table className="bordered-table">
        <thead>
          <tr>
            <th>Serial number</th>
            <th>Name</th>
            <th>Phone number</th>
            <th>Timestamp</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {issueRows}
        </tbody>
      </table>
    );
  }
}

class AddCustomer extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const form = document.forms.addCustomer;
    const issue = {
      name: form.name.value, phone: form.phone.value,
    }
    this.props.createIssue(issue);
    form.name.value = ""; form.phone.value = "";
  }

  render() {
    return (
      <form name="addCustomer" onSubmit={this.handleSubmit}>
        <input type="text" name="name" placeholder="Name" />
        <input type="text" name="phone" placeholder="Phone number" />
        <button>Add</button>
      </form>
    );
  }
}

class DeleteCustomer extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(d) {
    d.preventDefault();
    const form = document.forms.deleteCustomer;
    const issue = {
      id: form.id.value,
    }
    this.props.deleteIssue(issue);
    form.id.value = "";
  }

  render() {
    return (
      <form name="deleteCustomer" onSubmit={this.handleSubmit}>
        <input type="text" name="id" placeholder="Serial number" />
        <button>Delete</button>
      </form>
    );
  }
}

async function graphQLFetch(query, variables = {}) {
  try {
    const response = await fetch('/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({ query, variables })
    });
    const body = await response.text();
    const result = JSON.parse(body, jsonDateReviver);

    if (result.errors) {
      const error = result.errors[0];
      if (error.extensions.code == 'BAD_USER_INPUT') {
        const details = error.extensions.exception.errors.join('\n ');
        alert(`${error.message}:\n ${details}`);
      } else {
        alert(`${error.extensions.code}: ${error.message}`);
      }
    }
    return result.data;
  } catch (e) {
    alert(`Error in sending data to server: ${e.message}`);
  }
}


class DisplayHomepage extends React.Component {
  constructor() {
    super();
    this.state = { issues: [] };
    this.createIssue = this.createIssue.bind(this);
    this.deleteIssue = this.deleteIssue.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  async loadData() {
    const query = `query {
      issueList {
        id name phone timestamp
      }
    }`;

    const data = await graphQLFetch(query);
    if (data) {
      this.setState({ issues: data.issueList });
    }
  }

  async createIssue(issue) {
    if(this.state.issues.length == 25) {
      alert("There are no available slots in the waitlist!")
    } else {
    const query = `mutation issueAdd($issue: IssueInputs!){
        issueAdd(issue:$issue){
          id
        }
    }`;

    const data = await graphQLFetch(query, { issue });
    if (data) {
      this.loadData();
    }
    }
  }

  async deleteIssue(issue) {
    var check = 1;
    for (var i = 0; i < this.state.issues.length; i++) {
      if (this.state.issues[i].id == issue.id) {
        check = 0;
        break;
      }
    }

    if (check != 0) {
      alert("This serial number do not exist in the waitlist!")
    } else {
      const query = `mutation issueDelete($issue: SerialInputs!){
        issueDelete(issue:$issue){
          id
        }
    }`;

    const data = await graphQLFetch(query, { issue });
    if (data) {
      this.loadData();
    }
    }
  }

  render() {
    return (
      <React.Fragment>
        <h1>Welcome to Hotel California</h1>
        <DisplayFreeSlots freeSlots={this.state.issues.length}/>
        <hr />
        <DisplayCustomer issues={this.state.issues}/>
        <hr />
        <AddCustomer createIssue={this.createIssue} />
        <DeleteCustomer deleteIssue={this.deleteIssue}/>
      </React.Fragment>
    );
  }
}

const element = <DisplayHomepage />;

ReactDOM.render(element, document.getElementById('contents'));
