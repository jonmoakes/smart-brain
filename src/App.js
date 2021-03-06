import React, { Component } from "react";
import Navigation from "./components/Navigation/Navigation";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
import Logo from "./components/Logo/Logo";
import Rank from "./components/Rank/Rank";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import Particles from "react-particles-js";
import "./App.css";
import Signin from "./components/Signin/Signin";
import Register from "./components/Register/Register";

const particlesOptions = {
  particles: {
    number: {
      value: 125,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
};

const initialState = {
  input: "",
  imageUrl: "", // set initial state of input and imageurl to be empty
  box: {},
  route: "signin", // keeps track of page we're on
  isSignedIn: false,
  user: {
    id: "",
    name: "",
    email: "",
    entries: 0,
    joined: ""
  }
};

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = data => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
      }
    });
  };

  calculateFaceLocation = data => {
    const clarifaiFace =
      data.outputs[0].data.regions[0].region_info.bounding_box; // create a constant from the data which is the response from the api - data could be called whatever we wanted.
    const image = document.getElementById("inputImage"); // get the id from Facerecognition.js img tag
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width, // returning an object that uses the clarifaiFace const above. left_col is a percentage of the width so by timsing it by the width, we get where the left column should be
      topRow: clarifaiFace.top_row * height,
      rightCol: width - clarifaiFace.right_col * width,
      bottomRow: height - clarifaiFace.bottom_row * height
    };
  };

  displayFaceBox = coordinates => {
    this.setState({ box: coordinates }); // set the state of the box in the constructor to equal the coordinates
  };

  onInputChange = event => {
    this.setState({ input: event.target.value }); //when the input changes ( ie typed in box), set input to be whatever the value of the text box is
  };

  onButtonSubmit = () => {
    this.setState({ imageUrl: this.state.input }); // when button clicked, make the states imageurl to be whatever the text field input is. Note we don't try and set it to imageurl because of the way set state works - The trap Andrei talked about.
      fetch("https://lit-crag-86842.herokuapp.com/imageurl", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: this.state.input
        })
      })
      .then(response => response.json())
      .then(response => {
        if (response) {
          fetch("https://lit-crag-86842.herokuapp.com/image", {
            method: "put",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
          .then(response => response.json())
          .then(count => {
            this.setState(Object.assign(this.state.user, { entries: count }));
          })
          .catch(console.log)
        }
        this.displayFaceBox(this.calculateFaceLocation(response));
      }) // calculateFaceLocation takes a repsonse which returns the coordinates of the box. Then the returned object goes into the displayFaceLocation function.
      .catch(err => console.log(err)); // with a promise, whenever you have a .then you can use .catch to catch the error.
  };

  onRouteChange = route => {
    if (route === "signout") {
      this.setState(initialState);
    } else if (route === "home") {
      this.setState({ isSignedIn: true });
    }
    this.setState({ route: route });
  };

  render() {
    const { isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div className="App">
        <Particles className="particles" params={particlesOptions} />
        <Navigation
          isSignedIn={isSignedIn}
          onRouteChange={this.onRouteChange}
        />
        {route === "home"
        ? <div>
            <Logo />
            <Rank
              name={this.state.user.name}
              entries={this.state.user.entries}
            />
            <ImageLinkForm
              onInputChange={this.onInputChange}
              onButtonSubmit={this.onButtonSubmit}
            />
            <FaceRecognition coordinates={box} imageUrl={imageUrl} />
          </div>
          : (
            route === 'signin'
            ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
            : (
              route === 'signout'
              ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
              : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
            )
          )
        }
      </div>
    );
  }
}

export default App;

