

"use strict";

let database = firebase.database();

// Check projects
checkProjects();

function checkProjects() {
  var request = new XMLHttpRequest();

  request.open('GET', 'https://www.gdm.gent/trots/api/projects.json', true);
  request.onload = function () {
    // Begin accessing JSON data here
    var data = JSON.parse(this.response);

    if (request.status >= 200 && request.status < 400) {
      for (let i = 0; i < data.length; i++) {
        console.log('Project: ' + data[i].id);
        console.log('Project-id: ' + i);

        // Check projects

        firebase.database().ref('projects/project-' + i).once("value", function (snapshot) {

          if (snapshot.exists() == false) {
            firebase.database().ref('projects/project-' + i).set({
              views: 0,
              likes: 0,
              favorites: 0
            });
          }
        }, function (errorObject) {
          console.log("The read failed: " + errorObject.code);
        });
      }
    }
  };

  request.send();
}

// Get api data
function getHome() {
  var request = new XMLHttpRequest();

  request.open('GET', 'https://www.gdm.gent/trots/api/projects.json', true);
  request.onload = function () {

    // Begin accessing JSON data here
    var data = JSON.parse(this.response);

    if (request.status >= 200 && request.status < 400) {
      let images = console.log(data);

      let projectElement = document.getElementById('articleData');

      for (let i = 0; i < data.length; i++) {
        let articleTitle = document.querySelector('title');
        let image = document.querySelector('image');
        let description = document.querySelector('description');
        let name = document.querySelector('name');
        let major = document.querySelector('major');
        let minor = document.querySelector('minor');
        let year = document.querySelector('year');

        // title.innerHTML = data[i].title[i];
        projectElement.innerHTML += `
      <article>
          <h2 class="title">${data[i].title}</h2>
          <img class="image" src="${data[i].thumbnail_url}" alt="">
          <p class="description">${data[i].description}</p>
          <ul class="author">
              <li class="name">${data[i].members[0].name}</li>
              <li class="major">${data[i].members[0].major}</li>
              <li class="minor">${data[i].members[0].minor}</li>
              <li class="year">${data[i].members[0].year}</li>
          </ul>
          <a href="detail-${i}" class="leesMeerBtn">Lees Meer</a>
          <hr>
      </article>`;
      }

      firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
          let loginBtn = document.querySelector('#userState');
          loginBtn.innerHTML = `<a href="/profile"><i class="fa fa-user"></i></a>`;
          console.log(loginBtn.innerHTML);
          console.log('logged in');
        } else {
          console.log('logged out');
        }
      });

      console.log('test');
    } else {
      console.log('error');
    }
  };

  request.send();
}

function getDetail(id) {
  console.log('test');
  // Current likes, views
  let currentViews;
  let currentLikes;
  let currentFavorites;

  firebase.database().ref('projects/project-' + id).once("value", function (snapshot) {

    currentViews = snapshot.val().views;
    currentViews++;

    addView(id, currentViews);

    console.log('Project-id: ' + id);
    console.log("Actual views: " + currentViews);

    currentLikes = snapshot.val().likes;
    currentLikes++;

    currentFavorites = snapshot.val().favorites;
    currentFavorites++;

    document.getElementById('like').addEventListener('click', function () {
      addLike(id, currentLikes);
    });

    document.getElementById('favorite').addEventListener('click', function () {
      favoriteProject(id, currentFavorites);
    });
  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
  });

  // Add view
  function addView(id, currentViews) {
    if (isNaN(currentViews)) {
      console.log('Not a Number');
      firebase.database().ref('projects/project-' + id).set({
        views: 1,
        likes: 0
      });
    } else {
      console.log('Is a number');
      firebase.database().ref('projects/project-' + id).update({
        views: currentViews
      });
    }
  }

  function addLike(id, currentLikes) {

    document.querySelector('.actionBtn').addEventListener('click', function (event) {
      event.preventDefault();
    });

    console.log("Actual likes: " + currentLikes);
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        console.log('Poject Liked');
        firebase.database().ref('projects/project-' + id).update({
          likes: currentLikes
        });
      } else {
        window.alert('Login to be able to like projects.');
      }
    });
  }

  function favoriteProject(id, currentLikes) {

    document.querySelector('.actionBtn').addEventListener('click', function (event) {
      event.preventDefault();
    });
    // get project id

    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        console.log('Poject Favored');

        firebase.database().ref('projects/project-' + id).update({
          favorites: currentFavorites
        });
      } else {
        window.alert('Login to be able to favorite projects.');
      }
    });
  }

  // load data

  var request = new XMLHttpRequest();

  request.open('GET', 'https://www.gdm.gent/trots/api/projects.json', true);
  request.onload = function () {

    // Begin accessing JSON data here
    var data = JSON.parse(this.response);

    if (request.status >= 200 && request.status < 400) {

      /*
      let projectId = data[id].id;
      db.collection('projects').add({
        projectId: projectId,
        projectLikes: projectLikes
       });
      */

      // load page

      var client = new XMLHttpRequest();
      client.open('GET', '../dist/html/detail.html');
      client.onreadystatechange = function () {

        firebase.database().ref('projects/project-' + id).once("value", function (snapshot) {
          let page = String(client.responseText);
          currentViews = snapshot.val().views;
          currentLikes = snapshot.val().likes;

          page = page.replace('articleTitle', data[id].title);
          page = page.replace('articleDescription', data[id].description);
          page = page.replace('viewsCount', currentViews);
          page = page.replace('likesCount', currentLikes);

          for (let i = 0; i < data[id].media.length; i++) {
            page = page.replace("articleImage" + i, data[id].media[i].url);
          }

          page = page.replace('articleAuthor', data[id].members[0].name);
          page = page.replace('articleMajor', data[id].members[0].major);
          page = page.replace('articleMinor', data[id].members[0].minor);

          document.querySelector('html').innerHTML = page;
        }, function (errorObject) {
          console.log("The read failed: " + errorObject.code);
        });
      };
      client.send();

      firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
          let loginBtn = document.querySelector('#userState');
          loginBtn.innerHTML = `<a href="/profile"><i class="fa fa-user"></i></a>`;
          console.log('logged in');
        } else {
          console.log('logged out');
        }
      });
    } else {
      console.log('error');
    }
  };
  request.send();
}

function getBlog() {
  var request = new XMLHttpRequest();

  request.open('GET', 'https://www.gdm.gent/trots/api/stories.json', true);
  request.onload = function () {

    // Begin accessing JSON data here
    var data = JSON.parse(this.response);

    if (request.status >= 200 && request.status < 400) {
      console.log(data);

      var client = new XMLHttpRequest();
      client.open('GET', '../dist/html/blog.html');
      client.onreadystatechange = function () {
        let page = String(client.responseText);
        let articles;
        let content;
        for (let i = 0; i < data.length; i++) {
          content = `<article>
          <h2>${data[i].title}</h2>
          <p>${data[i].description}</p>
          <img src="${data[i].thumbnail_url}" alt="">
          <a href="${data[i].url}" target="_blank" class="leesMeerBtn">Lees Meer</a>
          </article>
          <hr>`;
          articles += content;
        }

        page = page.replace('<div id="articleData"></div>', articles);

        firebase.auth().onAuthStateChanged(function (user) {
          if (user) {
            let loginBtn = document.querySelector('#userState');
            page = page.replace('<a href="/login"><i class="fa fa-sign-in-alt"></i></a>', `<a href="/profile"><i class="fa fa-user"></i></a>`);
            document.querySelector('#articleData').innerHTML = page;
            console.log('logged in');
          } else {
            console.log('logged out');
            document.querySelector('#articleData').innerHTML = page;
          }
        });
      };
    }
    client.send();
  };
  request.send();
}

function getRegister() {
  console.log('test');
  var client = new XMLHttpRequest();
  client.open('GET', '../dist/html/registreren.html');
  client.onreadystatechange = function () {
    let page = String(client.responseText);
    document.querySelector('html').innerHTML = page;
    console.log(page);
  };
  client.send();
}

function postRegister() {
  console.log('POST');
  let createUsername = document.getElementById('username').value;
  let password = document.getElementById('password').value;
  let passwordRepeat = document.getElementById('password-repeat').value;
  let createEmail = document.getElementById('email').value;

  if (password == passwordRepeat && createUsername != null && password != null && createEmail != null) {

    firebase.database().ref('users/' + createUsername).set({
      username: createUsername,
      email: createEmail
    });

    firebase.auth().createUserWithEmailAndPassword(createEmail, password).catch(function (error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      if (errorCode == 'auth/weak-password') {
        alert('The password is too weak.');
      } else {
        alert(errorMessage);
      }

      // Save user data

      console.log(database.ref('users/koen'));

      //window.location.pathname = '/';
    });
  }
}

function getLogin() {
  var client = new XMLHttpRequest();
  client.open('GET', '../dist/html/login.html');
  client.onreadystatechange = function () {
    let page = String(client.responseText);
    document.querySelector('html').innerHTML = page;
    console.log(page);
  };
  client.send();
}

function getProfile() {
  var client = new XMLHttpRequest();
  client.open('GET', '../dist/html/profiel.html');
  client.onreadystatechange = function () {
    let page = String(client.responseText);
    document.querySelector('html').innerHTML = page;
    console.log(page);
  };
  client.send();
}

function postLogin() {

  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      console.log('logged in');
    } else {
      console.log('POST LOGIN');
      let email = document.getElementById('email').value;
      let password = document.getElementById('password').value;

      firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
      });
    }
  });
}

function getInfo() {
  var client = new XMLHttpRequest();
  client.open('GET', '../dist/html/info.html');
  client.onreadystatechange = function () {

    let page = String(client.responseText);
    document.querySelector('html').innerHTML = page;
  };
  client.send();
}

function logout() {
  firebase.auth().signOut();
}

// check user state for page permission
let userState;

function checkUserState() {
  console.log('Checking User State...');
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      console.log('logged in');
      return userState = true;
    } else {
      console.log('logged out');
      return userState = false;
    }
  });
}

function shareProject() {
  document.querySelector('.actionBtn').addEventListener('click', function (event) {
    event.preventDefault();
  });
  window.alert('Sharing to FaceBook...');
}
window.onload = function () {
  console.log('DOM has loaded');
  // create a Router constructor 
  var view = document.querySelector('body');
  // grab all active attribute routes  
  var activeRoutes = Array.from(document.querySelectorAll('[route]'));
  function navigate(event) {
    var route = event.target.attributes[0].value;
    var routeInfo = myFirstRouter.routes.filter(function (r) {
      return r.path === route;
    })[0];
    if (!routeInfo) {
      window.history.pushState({}, '', 'error');
      view.innerHTML = 'No route exists with this path';
    } else {
      window.history.pushState({}, '', routeInfo.path);
      console.log(window.history);
      view.innerHTML = 'You have clicked the ' + routeInfo.name + ' route';
    }
  };
  // add event listeners
  activeRoutes.forEach(function (route) {
    route.addEventListener('click', navigate, false);
  });
  var Router = function (name, routes) {
    return {
      name: name,
      routes: routes
    };
  };
  var myFirstRouter = new Router('myFirstRouter', [{
    path: '/',
    name: 'Root'
  }, {
    path: '/detail',
    name: 'Detail'
  }, {
    path: '/contact',
    name: 'Contact'
  }]);
  var currentPath = window.location.pathname;
  var currentHref = window.location.href;

  var path = currentPath.split(/\D+/);
  var id = path[1];
  if (currentPath === '/' || currentPath === '/home' || currentPath === '/home.html') {
    getHome();
  }
  if (currentPath === "/detail-" + id) {
    return getDetail(id);
  }
  if (currentPath === "/blog") {
    getBlog();
  }

  if (currentPath === "/info") {
    getInfo();
  }

  if (currentPath === "/register") {
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        window.location.pathname = '/home';
        window.alert('You\'re already logged in');
      } else {
        getRegister();
      }
    });
  }
  if (currentPath === "/login") {
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        window.location.pathname = '/home';
        window.alert('You\'re already logged in');
      } else {
        getLogin();
      }
    });
  }

  if (currentPath === "/profile") {
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        getProfile();
      } else {
        window.alert('You\'re aren\'t logged in, login first');
        getLogin();
      }
    });
  }
};
