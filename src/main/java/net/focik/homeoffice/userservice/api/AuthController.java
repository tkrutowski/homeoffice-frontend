package net.focik.homeoffice.userservice.api;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import net.focik.homeoffice.userservice.api.dto.UserLoginDto;
import net.focik.homeoffice.userservice.domain.AppUser;
import net.focik.homeoffice.userservice.domain.SecureUser;
import net.focik.homeoffice.userservice.domain.port.primary.IGetUserUseCase;
import net.focik.homeoffice.userservice.domain.utility.JwtTokenProvider;
import net.focik.homeoffice.utils.exceptions.ExceptionHandling;
import net.focik.homeoffice.utils.exceptions.HttpResponse;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static net.focik.homeoffice.userservice.domain.security.constant.SecurityConstant.JWT_TOKEN_HEADER;
import static org.springframework.http.HttpStatus.OK;

//@CrossOrigin
@Log4j2
@RequiredArgsConstructor
@RestController
@RequestMapping(path = {"/api/auth"})
//najpierw sprawdza czy jest jakiś exception handler w exceptionHandling
public class AuthController extends ExceptionHandling {

    private final ModelMapper mapper;
    private final IGetUserUseCase getUserUseCase;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;


    @PostMapping("/login")
    public ResponseEntity<UserLoginDto> login(@RequestBody AppUser user) {
        int o = 0;
        authenticate(user.getUsername(), user.getPassword());
        AppUser loginUser = getUserUseCase.findUserByUsername(user.getUsername());
        SecureUser secureUser = new SecureUser(loginUser);
        HttpHeaders jwtHeader = getJwtHeader(secureUser);

        UserLoginDto loginDto = mapper.map(loginUser, UserLoginDto.class);
        return new ResponseEntity<>(loginDto, jwtHeader, OK);
    }

    private HttpHeaders getJwtHeader(SecureUser user) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(JWT_TOKEN_HEADER, jwtTokenProvider.generateJwtAccessToken(user));
//        headers.add("Access-Control-Request-Headers", "Authorization");
        // headers.add("Access-Control-Request-Headers", JWT_TOKEN_HEADER);
        return headers;
    }

    private void authenticate(String username, String password) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
    }

    private ResponseEntity<HttpResponse> response(HttpStatus status, String message) {
        HttpResponse body = new HttpResponse(status.value(), status, status.getReasonPhrase(), message);
        return new ResponseEntity<>(body, status);
    }
}
