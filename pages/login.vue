<template>
  <div class="auth-page">
    <div class="container page">
      <div class="row">
        <div class="col-md-6 offset-md-3 col-xs-12">
          <h1 class="text-xs-center">
            Sign In
          </h1>
          <p class="text-xs-center">
            <n-link to="/register">
              Need an account?
            </n-link>
          </p>

          <ul v-if="hasError" class="error-messages">
            <li v-for="(message, i) of errorMessages" :key="i">
              {{ message }}
            </li>
          </ul>

          <form @submit.prevent="login($event)">
            <fieldset class="form-group">
              <input v-model="email" class="form-control form-control-lg" type="text" placeholder="Email">
            </fieldset>
            <fieldset class="form-group">
              <input v-model="password" class="form-control form-control-lg" type="password" placeholder="Password">
            </fieldset>
            <button class="btn btn-lg btn-primary pull-xs-right">
              Sign In
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
export default class LoginPage extends Vue {
  @State errorMessages!: string[]
  @Getter hasError!: boolean

  email: string = ''
  password: string = ''

  async login() {
    this.$store.commit('clearError')

    const loginInfo = {
      email: this.email,
      password: this.password
    }

    try {
      await this.$auth.login({ data: { user: loginInfo } })
      this.$router.push('/')
    } catch (e) {
      this.$store.commit('pushError', e.response.data)
    }
  }
}
</script>
