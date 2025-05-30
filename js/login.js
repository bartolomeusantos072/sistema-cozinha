// login.js
let auth2, googleUser

// Carrega configurações e inicializa
const init = async () => {
  try {
    const response = await fetch('./js/config.json')
    const config = await response.json()
    const clientId = config.web.client_id

    gapi.load('auth2', () => {
      auth2 = gapi.auth2.init({
        client_id: clientId,
        scope: 'profile email'
      })

      auth2.isSignedIn.listen(onSigninChanged)
      auth2.currentUser.listen(onUserChanged)

      if (auth2.isSignedIn.get()) {
        auth2.signIn()
      }

      renderUI()
      refreshUI()
    })
  } catch (err) {
    console.error('Erro ao carregar config.json:', err)
    document.getElementById('app').innerHTML = `<p>Erro ao iniciar login com Google.</p>`
  }
}

const renderUI = () => {
  const container = document.getElementById('app')
  container.innerHTML = `
    <h1>Login da Cozinheira</h1>
    <div id="g-sign-in-wrapper">
      <button id="google-login-btn">
        <span id="sign-in-button-text">Entrar com a Conta Google</span>
      </button>
    </div>
    <button id="button-sign-out" style="display: none;">Sair</button>
    <div id="user-details-wrapper"></div>
  `

  document.getElementById('google-login-btn').addEventListener('click', () => {
    auth2.signIn().then(user => onSuccessfulLogin(user))
  })

  document.getElementById('button-sign-out').addEventListener('click', () => {
    auth2.signOut().then(() => {
      sessionStorage.clear()
      window.location.reload()
    })
  })
}

const onSuccessfulLogin = (googleUser) => {
  const profile = googleUser.getBasicProfile()
  sessionStorage.setItem('logada', 'true')
  sessionStorage.setItem('nome', profile.getName())
  sessionStorage.setItem('email', profile.getEmail())
  sessionStorage.setItem('foto', profile.getImageUrl())

  alert(`Bem-vinda, ${profile.getName()}!`)
  window.location.href = 'dashboard.html'
}

const onSigninChanged = (isSignedIn) => {
  refreshUI()
}

const onUserChanged = (user) => {
  googleUser = user
  updateUserInfo()
}

const refreshUI = () => {
  const isLogged = auth2.isSignedIn.get()
  document.getElementById('button-sign-out').style.display = isLogged ? 'block' : 'none'
  document.getElementById('sign-in-button-text').textContent = isLogged
    ? 'Logada com Google'
    : 'Entrar com a Conta Google'
}

const updateUserInfo = () => {
  const container = document.getElementById('user-details-wrapper')
  container.innerHTML = ''

  if (auth2.isSignedIn.get()) {
    const profile = googleUser.getBasicProfile()

    container.innerHTML = `
      <h2>Usuária Logada</h2>
      <img src="${profile.getImageUrl()}" class="avatar" alt="Foto" />
      <p><strong>${profile.getName()}</strong></p>
      <p><a href="mailto:${profile.getEmail()}">${profile.getEmail()}</a></p>
    `
  }
}

window.onload = init
