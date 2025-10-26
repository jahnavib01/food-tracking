package com.smartpantry.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import com.smartpantry.model.Models.User;
import com.smartpantry.service.InMemoryStore;
import com.smartpantry.security.JwtUtil;

import java.util.*;
import java.security.SecureRandom;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  static String hashPassword(String password, String salt) {
    try {
      MessageDigest md = MessageDigest.getInstance("SHA-256");
      md.update(salt.getBytes(StandardCharsets.UTF_8));
      byte[] h = md.digest(password.getBytes(StandardCharsets.UTF_8));
      StringBuilder sb = new StringBuilder();
      for (byte b : h) sb.append(String.format("%02x", b));
      return sb.toString();
    } catch (Exception e) { throw new RuntimeException(e); }
  }

  static String genSalt() {
    byte[] b = new byte[16];
    new SecureRandom().nextBytes(b);
    return Base64.getUrlEncoder().withoutPadding().encodeToString(b);
  }

  static class SignupReq { public String email; public String password; public String role; }
  static class LoginReq { public String email; public String password; }
  static class AuthResp { public String token; public Map<String,Object> user; }

  @PostMapping("/signup")
  public ResponseEntity<?> signup(@RequestBody SignupReq r) {
    String email = (r.email == null ? "" : r.email).toLowerCase().trim();
    if (email.isEmpty() || r.password == null || r.password.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error","email and password required"));
    // simple existing check
    for (User u : InMemoryStore.users.values()) if (u.email.equals(email)) return ResponseEntity.status(409).body(Map.of("error","User exists"));
    String id = UUID.randomUUID().toString();
    String salt = genSalt();
    String hash = hashPassword(r.password, salt);
    String role = r.role == null ? "user" : r.role;
    User u = InMemoryStore.createUser(id, email, role, hash, salt);
    String token = JwtUtil.generateToken(u.id, u.email, u.role);
    AuthResp resp = new AuthResp();
    resp.token = token; resp.user = Map.of("id", u.id, "email", u.email, "role", u.role);
    return ResponseEntity.status(201).body(resp);
  }

  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody LoginReq r) {
    String email = (r.email == null ? "" : r.email).toLowerCase().trim();
    for (User u : InMemoryStore.users.values()) {
      if (u.email.equals(email)) {
        String h = hashPassword(r.password, u.salt);
        if (h.equals(u.passwordHash)) {
          String token = JwtUtil.generateToken(u.id, u.email, u.role);
          AuthResp resp = new AuthResp();
          resp.token = token; resp.user = Map.of("id", u.id, "email", u.email, "role", u.role);
          return ResponseEntity.ok(resp);
        }
      }
    }
    return ResponseEntity.status(401).body(Map.of("error","Invalid credentials"));
  }

  @GetMapping("/me")
  public ResponseEntity<?> me(@RequestHeader(value = "Authorization", required = false) String auth) {
    if (auth == null || !auth.startsWith("Bearer ")) return ResponseEntity.status(401).body(Map.of("error","Unauthorized"));
    try {
      var claims = JwtUtil.parseToken(auth.substring(7));
      return ResponseEntity.ok(Map.of("id", claims.getSubject(), "email", claims.get("email"), "role", claims.get("role")));
    } catch (Exception e) {
      return ResponseEntity.status(401).body(Map.of("error","Invalid token"));
    }
  }
}
