import React from 'react'
import Header from './Header'
import Hero from './Hero'
import Features from './Features'
import Stats from './Status'
import Footer from './Footer'

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* <Header /> */}
      <Hero />
      <Features />
      <Stats />
      <Footer />
    </div>
  )
}

export default Home
