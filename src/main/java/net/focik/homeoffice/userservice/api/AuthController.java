package net.focik.homeoffice.userservice.api;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import net.focik.homeoffice.userservice.api.dto.UserLoginDto;
import net.focik.homeoffice.userservice.domain.AppUser;
import net.focik.homeoffice.userservice.domain.SecureUser;
import net.focik.homeoffice.userservice.domain.port.primary.IGetUserUseCase;
import net.focik.homeoffice.userservice.domain.utility.JwtTokenProvider;
import net.focik.homeoffice.utils.exceptions.ExceptionHandling;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import static net.focik.homeoffice.userservice.domain.security.constant.SecurityConstant.JWT_TOKEN_HEADER;

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
        authenticate(user.getUsername(), user.getPassword());
        AppUser loginUser = getUserUseCase.findUserByUsername(user.getUsername());
        SecureUser secureUser = new SecureUser(loginUser);
        HttpHeaders jwtHeader = getJwtHeader(secureUser);

        UserLoginDto loginDto = mapper.map(loginUser, UserLoginDto.class);
        return new ResponseEntity<>(loginDto, jwtHeader, HttpStatus.OK);
    }

    private HttpHeaders getJwtHeader(SecureUser user) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(JWT_TOKEN_HEADER, jwtTokenProvider.generateJwtAccessToken(user));
        return headers;
    }

    private void authenticate(String username, String password) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
    }
}