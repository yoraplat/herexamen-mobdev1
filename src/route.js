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
      window.history.pushState({}, '', 'error')
      view.innerHTML = 'No route exists with this path'
    }
    else {
      window.history.pushState({}, '', routeInfo.path);
      console.log(window.history);
      view.innerHTML = 'You have clicked the ' + routeInfo.name + ' route'
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
    }
  };
  var myFirstRouter = new Router('myFirstRouter', [
    {
      path: '/',
      name: 'Root'
    },    
    {
      path: '/detail',
      name: 'Detail'
    },
    {
      path: '/contact',
      name: 'Contact'
    }
  ]);
  var currentPath = window.location.pathname;
  var currentHref = window.location.href;

  var path = currentPath.split(/\D+/);
  var id = path[1];
  if (currentPath === '/' || currentPath === '/home' || currentPath === '/home.html') {
    getHome();
    
  } 
  if (currentPath === "/detail-"+id) {
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
}