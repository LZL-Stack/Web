<template>
  <div id="app">
    <header class="site-header">
      <div class="header-inner">
        <router-link to="/" class="logo">🎬 视频网站</router-link>
        <nav>
          <router-link to="/">首页</router-link>
        </nav>
      </div>
    </header>
    <main class="site-main">
      <router-view />
    </main>
  </div>
</template>

<style>
body {
  background: #f5f5f5;
  color: #333;
}

.site-header {
  background: #1a1a2e;
  color: #fff;
  padding: 0 24px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: #fff;
  text-decoration: none;
}

nav a {
  color: #ccc;
  text-decoration: none;
  margin-left: 20px;
  font-size: 14px;
  transition: color 0.2s;
}

nav a:hover,
nav a.router-link-active {
  color: #fff;
}

.site-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 24px 40px;
  min-height: 100vh;
}
</style>
