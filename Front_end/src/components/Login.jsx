import React from 'react'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import NavDropdown from 'react-bootstrap/NavDropdown'
import Container from 'react-bootstrap/Container'
import logoSrc from '../assets/nurture-logo.png'
import babyImgi from '../Images/babyImg-01.jpg'
import babyImgii from '../Images/babyImg-02.jpg'
import babyImgiii from '../Images/babyImg-03.jpg'
import babyImgiv from '../Images/babyImg-04.jpg'
import './Login.css'



const Login = () => {
  return (
    <div className='page-hero'>
      <Navbar expand='lg' className='custom-navbar' variant='light'>
        <Container>
          <Navbar.Brand href='/' className='brand-wrap'>
            <img
              src={logoSrc}
              alt='Logo'
              className='brand-logo'
            />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls='basic-navbar-nav' />
          <Navbar.Collapse id='basic-navbar-nav'>
            <Nav className='me-auto Nav-links-login'>
              <Nav.Link href='/Home'>Home</Nav.Link>
              <Nav.Link href='/Parents'>Parents</Nav.Link>
              <Nav.Link href='/Clinics'>Clinics</Nav.Link>
              <Nav.Link href='/Request a Demo'>Request a Demo</Nav.Link>
              <NavDropdown title='Login' id='login-nav-dropdown' className='login-dropdown'>
                <NavDropdown.Item href='/login/Physician'>Physician</NavDropdown.Item>
                <NavDropdown.Item href='/login/Super Admin'>Super Admin</NavDropdown.Item>
                <NavDropdown.Item href='/login/Hospital Admin'>Hospital Admin</NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <div className='hero-content'>
        <br/>
        <h7>Welcome to Nurture</h7>
        <h1>Your Child's Health, <br/> Our Priority</h1>
        <button className='get-button'>Get Started</button>
        <div className='hero-grid'>
          <div className='hero-card'>
            <div className='hero-card-image'>
              <img src={babyImgi} alt='Baby' />
            </div>
            <h4>Measurement</h4>
          </div>
          <div className='hero-card'>
            <div className='hero-card-image'>
              <img src={babyImgii} alt='Baby' />
            </div>
            <h4>Vitals</h4>
          </div>
          <div className='hero-card'>
            <div className='hero-card-image'>
              <img src={babyImgiii} alt='Baby' />
            </div>
            <h4>Development</h4>
          </div>
          <div className='hero-card'>
            <div className='hero-card-image'>
              <img src={babyImgiv} alt='Baby' />
            </div>
            <h4>Vaccination</h4>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login; 
