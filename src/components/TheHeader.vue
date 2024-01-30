<template>
  <div id="logo-back" class="color-orange d-none d-md-flex">
    <img id="logo" alt="HomeOffice logo" src="../assets/HomeOffice.png" />
    <h1 id="name">HomeOffice</h1>
  </div>
  <div id="logo-back-mobile" class="color-orange d-md-none">
    <img
      id="logo-mobile"
      alt="HomeOffice logo"
      src="../assets/HomeOffice.png"
    />
    <h1 id="name-mobile">HomeOffice</h1>
  </div>
  <br />
</template>
<script lang="ts" setup></script>

<style scoped>
#logo {
  width: 150px;
  height: 150px;
  margin-left: 50px;
  margin-top: 50px;
}

#logo-mobile {
  width: 75px;
  height: 75px;
  margin-left: 5px;
  margin-top: 5px;
}

#logo-back {
  display: flex;
  justify-content: space-between;
  height: 250px;
  width: auto;
  background-color: #515455 !important;
}

#logo-back-mobile {
  display: flex;
  justify-content: space-between;
  height: 100px;
  width: auto;
  background-color: #515455 !important;
}

#name {
  padding-top: 100px;
  padding-right: 50px;
}

#name-mobile {
  padding-top: 20px;
  padding-right: 50px;
}
</style>
