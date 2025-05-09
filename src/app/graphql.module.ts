import {NgModule} from '@angular/core';
import { Apollo, ApolloModule } from 'apollo-angular';
import { ApolloLink , DefaultOptions, InMemoryCache } from '@apollo/client/core';
import { onError } from '@apollo/client/link/error'

import { HttpLink } from 'apollo-angular/http';
import { HttpClientModule, HttpHeaders } from '@angular/common/http';
import { GlobalService } from './services/global.service';
import { Router } from '@angular/router';
import { getOperationAST } from 'graphql';
import { AuthService } from './services/auth.service';
// @ts-ignore
import extractFiles from 'extract-files/extractFiles.mjs';
// @ts-ignore
import isExtractableFile from 'extract-files/isExtractableFile.mjs';
import { MatDialog } from '@angular/material/dialog';

@NgModule({
  exports: [
    HttpClientModule,
    ApolloModule,
  ]
})
export class GraphQLModule {
  constructor(
      apollo: Apollo,
      httpLink: HttpLink,
      globalService: GlobalService,
      authService: AuthService,
      router: Router,
      private matDialog:MatDialog
  ) {
      const uri =  globalService.urlBase;

      /**
       * Function to controller global errors GraphQL
       */
      const errorLink = onError(({ graphQLErrors, networkError,response }) => {
        if (graphQLErrors)
          console.log('[GraphQL errors]:', graphQLErrors);
          if(graphQLErrors instanceof Array){
            graphQLErrors.map(async ({ message,extensions }) =>{
                if(message == 'Unauthenticated.') {
                  localStorage.clear();
                  authService.eventAuthUser.next(undefined);
                  router.navigateByUrl('/autentificacion/acceso');
                }

                if (message == "El usuario se encuentra bloqueado.") {
                  setTimeout(() => {
                    this.matDialog.closeAll();
                    localStorage.clear();
                    authService.eventAuthUser.next(undefined);
                    router.navigateByUrl('/autentificacion/acceso');
                    globalService.showInfo({msg:'messages.blocked_user_msg'})
                  }, 300);
                }
              }
            );
          }
        if (networkError) console.log('[Network error]: ', networkError);
      });

      /**
       * Function to set request GraphQL
       */
      const http = httpLink.create({
        uri,
        extractFiles: (body) => extractFiles(body, isExtractableFile),
        useMultipart: true
      });

      const authMiddleware = new ApolloLink((operation, forward) => {
        operation.setContext({
          headers: new HttpHeaders().set(
            'Authorization',
            `Bearer ${authService.getTokenAuth()}`,
          )
        });
        return forward(operation);
      });

      const linkRequest = authMiddleware.concat(http);

      const httpConfig = ApolloLink.split( operation => {
        const operationAST = getOperationAST(operation.query, operation.operationName);
          return !!operationAST;
        },
        linkRequest
      );

      const httpLinkWithErrorHandling = ApolloLink.from([
        errorLink,
        httpConfig
      ]);

      // Disable Apollo client cache
      const defaultOptions: DefaultOptions = {
        watchQuery: {
          fetchPolicy: 'no-cache',
          errorPolicy: 'ignore',
        },
        query: {
          fetchPolicy: 'no-cache',
          errorPolicy: 'all',
        },
        mutate: {
          fetchPolicy: 'no-cache',
          errorPolicy: 'all',
        }
      }

      apollo.create({
          link: httpLinkWithErrorHandling,
          cache: new InMemoryCache(),
          defaultOptions: defaultOptions,
      });
  }
}