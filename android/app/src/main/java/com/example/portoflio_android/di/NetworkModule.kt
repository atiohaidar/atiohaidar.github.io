package com.example.portoflio_android.di

import com.example.portoflio_android.data.local.TokenManager
import com.example.portoflio_android.data.network.ApiConfig
import com.example.portoflio_android.data.network.AuthInterceptor
import com.example.portoflio_android.data.network.api.*
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit
import javax.inject.Singleton

/**
 * Hilt module for network dependencies.
 */
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    
    @Provides
    @Singleton
    fun provideGson(): Gson = GsonBuilder()
        .setLenient()
        .create()
    
    @Provides
    @Singleton
    fun provideLoggingInterceptor(): HttpLoggingInterceptor {
        return HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BASIC
        }
    }
    
    @Provides
    @Singleton
    fun provideOkHttpClient(
        authInterceptor: AuthInterceptor,
        loggingInterceptor: HttpLoggingInterceptor
    ): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor(authInterceptor)
            .addInterceptor(loggingInterceptor)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
    }
    
    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient, gson: Gson): Retrofit {
        return Retrofit.Builder()
            .baseUrl(ApiConfig.BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create(gson))
            .build()
    }
    
    // API Services
    @Provides
    @Singleton
    fun provideAuthApiService(retrofit: Retrofit): AuthApiService {
        return retrofit.create(AuthApiService::class.java)
    }
    
    @Provides
    @Singleton
    fun provideTaskApiService(retrofit: Retrofit): TaskApiService {
        return retrofit.create(TaskApiService::class.java)
    }
    
    @Provides
    @Singleton
    fun provideRoomApiService(retrofit: Retrofit): RoomApiService {
        return retrofit.create(RoomApiService::class.java)
    }
    
    @Provides
    @Singleton
    fun provideStatsApiService(retrofit: Retrofit): StatsApiService {
        return retrofit.create(StatsApiService::class.java)
    }
    
    @Provides
    @Singleton
    fun provideUserApiService(retrofit: Retrofit): UserApiService {
        return retrofit.create(UserApiService::class.java)
    }
    
    @Provides
    @Singleton
    fun provideArticleApiService(retrofit: Retrofit): ArticleApiService {
        return retrofit.create(ArticleApiService::class.java)
    }
    
    @Provides
    @Singleton
    fun provideEventApiService(retrofit: Retrofit): EventApiService {
        return retrofit.create(EventApiService::class.java)
    }
    
    @Provides
    @Singleton
    fun provideTicketApiService(retrofit: Retrofit): TicketApiService {
        return retrofit.create(TicketApiService::class.java)
    }
    
    @Provides
    @Singleton
    fun provideFormApiService(retrofit: Retrofit): FormApiService {
        return retrofit.create(FormApiService::class.java)
    }
    
    @Provides
    @Singleton
    fun provideItemApiService(retrofit: Retrofit): ItemApiService {
        return retrofit.create(ItemApiService::class.java)
    }
    
    @Provides
    @Singleton
    fun provideChatApiService(retrofit: Retrofit): ChatApiService {
        return retrofit.create(ChatApiService::class.java)
    }
    
    @Provides
    @Singleton
    fun provideDiscussionApiService(retrofit: Retrofit): DiscussionApiService {
        return retrofit.create(DiscussionApiService::class.java)
    }
    
    @Provides
    @Singleton
    fun provideAnonymousChatApiService(retrofit: Retrofit): AnonymousChatApiService {
        return retrofit.create(AnonymousChatApiService::class.java)
    }
    
    @Provides
    @Singleton
    fun provideTransactionApiService(retrofit: Retrofit): TransactionApiService {
        return retrofit.create(TransactionApiService::class.java)
    }
}


