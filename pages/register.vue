<template>
  <div class="auth-page">
    <div class="container page">
      <div class="row">
        <div class="col-md-6 offset-md-3 col-xs-12">
          <h1 class="text-xs-center">
            Sign Up
          </h1>
          <p class="text-xs-center">
            <n-link to="login">
              Have an account?
            </n-link>
          </p>

          <ul v-if="hasError" class="error-messages">
            <li v-for="(message, i) of errorMessages" :key="i">
              {{ message }}
            </li>
          </ul>

          <form @submit.prevent="regist($event)">
            <fieldset class="form-group">
              <input v-model="username" class="form-control form-control-lg" type="text" name="username" placeholder="Your Name">
            </fieldset>
            <fieldset class="form-group">
              <input v-model="email" class="form-control form-control-lg" type="email" name="email" placeholder="Email">
            </fieldset>
            <fieldset class="form-group">
              <input v-model="password" class="form-control form-control-lg" type="password" name="password" placeholder="Password">
            </fieldset>
            <button class="btn btn-lg btn-primary pull-xs-right" type="submit">
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, State, Getter } from 'nuxt-property-decorator'

@Component
export default class RegisterPage extends Vue {
  username: string = ''
  email: string = ''
  password: string = ''

  @State errorMessages!: string[]
  @Getter hasError!: boolean

  formValidate() {
    this.$store.commit('clearError')

    const errors: string[] = []

    if (!this.username) {
      errors.push('Name is required')
    } else if (this.username === 'Eric') {
      errors.push('That username is already used')
    }

    if (!this.email) {
      errors.push('Email is required')
    } else if (this.email === 'email@test.com') {
      errors.push('That email is already taken')
    }

    if (!this.password) {
      errors.push('password is required')
    }

    this.$store.commit('pushError', { errors: { body: errors } })

    return errors.length
  }

  async regist() {
    if (this.formValidate()) {
      return false
    }

    this.$store.commit('clearError')

    const registInfo = {
      email: this.email,
      username: this.username,
      password: this.password
    }

    try {
      await this.$axios.$post('/users', { user: registInfo })
      await this.$auth.login({ data: { user: registInfo } })
      this.$router.push('/')
    } catch (e) {
      this.$store.commit('pushError', e.response.data)
    }

    return true
  }
}
</script>
