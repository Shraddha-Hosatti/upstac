package org.upgrad.upstac.auth;

import io.swagger.annotations.Api;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.upgrad.upstac.auth.models.LoginRequest;
import org.upgrad.upstac.auth.models.LoginResponse;
import org.upgrad.upstac.auth.register.RegisterRequest;
import org.upgrad.upstac.config.security.TokenProvider;
import org.upgrad.upstac.exception.AppException;
import org.upgrad.upstac.users.User;
import org.upgrad.upstac.users.UserService;

import static org.upgrad.upstac.exception.UpgradResponseStatusException.asBadRequest;

@RestController
@RequestMapping("/auth")
public class AuthController {


    private AuthenticationManager authenticationManager;

    private TokenProvider tokenProvider;

    private UserService userService;


    private static final Logger log = LoggerFactory.getLogger(AuthController.class);


    @Autowired
    public AuthController(AuthenticationManager authenticationManager, TokenProvider tokenProvider, UserService userService) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userService = userService;
    }

    @RequestMapping(value = "/greetings", method = RequestMethod.GET)
    public ResponseEntity<?> greetings()  {

        return ResponseEntity.ok("Hello Sir");
    }


    @RequestMapping(value = "/login", method = RequestMethod.POST)
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) throws AuthenticationException {

        try {

            final Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUserName(),
                            loginRequest.getPassword()
                    )
            );

            if(userService.isApprovedUser( loginRequest.getUserName()) == false){
                throw new AppException("User Not Approved");
            }



            SecurityContextHolder.getContext().setAuthentication(authentication);
            final String token = tokenProvider.generateToken(authentication);
            LoginResponse result = new LoginResponse(loginRequest.getUserName(), "Success", token);

            return ResponseEntity.ok(result);


        } catch (AppException e) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, e.getMessage(), e);
        }catch (AuthenticationException e) {
            e.printStackTrace();
            log.info("AuthenticationException" + e.getMessage());
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Bad credentials", e);
        }

    }

}
