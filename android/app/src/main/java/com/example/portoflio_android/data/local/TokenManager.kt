package com.example.portoflio_android.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.example.portoflio_android.data.models.User
import com.example.portoflio_android.data.models.UserRole
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.runBlocking
import javax.inject.Inject
import javax.inject.Singleton

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "auth_prefs")

/**
 * Token and user data manager using DataStore.
 */
@Singleton
class TokenManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    companion object {
        private val TOKEN_KEY = stringPreferencesKey("auth_token")
        private val USERNAME_KEY = stringPreferencesKey("username")
        private val NAME_KEY = stringPreferencesKey("name")
        private val ROLE_KEY = stringPreferencesKey("role")
    }
    
    /**
     * Get token synchronously (for interceptor).
     */
    fun getToken(): String? = runBlocking {
        context.dataStore.data.map { preferences ->
            preferences[TOKEN_KEY]
        }.first()
    }
    
    /**
     * Save authentication data.
     */
    suspend fun saveAuth(token: String, user: User) {
        context.dataStore.edit { preferences ->
            preferences[TOKEN_KEY] = token
            preferences[USERNAME_KEY] = user.username
            preferences[NAME_KEY] = user.name
            preferences[ROLE_KEY] = user.role.name
        }
    }
    
    /**
     * Get current user.
     */
    suspend fun getUser(): User? {
        return context.dataStore.data.map { preferences ->
            val username = preferences[USERNAME_KEY]
            val name = preferences[NAME_KEY]
            val role = preferences[ROLE_KEY]
            
            if (username != null && name != null && role != null) {
                User(
                    username = username,
                    name = name,
                    role = UserRole.valueOf(role)
                )
            } else null
        }.first()
    }
    
    /**
     * Check if user is logged in.
     */
    suspend fun isLoggedIn(): Boolean {
        return getToken()?.isNotEmpty() == true
    }
    
    /**
     * Clear all auth data (logout).
     */
    suspend fun clear() {
        context.dataStore.edit { preferences ->
            preferences.remove(TOKEN_KEY)
            preferences.remove(USERNAME_KEY)
            preferences.remove(NAME_KEY)
            preferences.remove(ROLE_KEY)
        }
    }
}
