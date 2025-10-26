package com.smartpantry.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.Claims;

import java.security.Key;
import java.util.Date;
import java.util.Map;

public class JwtUtil {
  private static final String SECRET = System.getenv().getOrDefault("JWT_SECRET", "dev-secret-java");
  private static final Key KEY = Keys.hmacShaKeyFor(SECRET.getBytes());
  private static final long DEFAULT_TTL = 1000L * 60 * 60 * 24 * 7; // 7 days

  public static String generateToken(String userId, String email, String role) {
    long now = System.currentTimeMillis();
    return Jwts.builder()
      .setSubject(userId)
      .setClaims(Map.of("email", email, "role", role))
      .setIssuedAt(new Date(now))
      .setExpiration(new Date(now + DEFAULT_TTL))
      .signWith(KEY, SignatureAlgorithm.HS256)
      .compact();
  }

  public static Claims parseToken(String token) {
    return Jwts.parserBuilder().setSigningKey(KEY).build().parseClaimsJws(token).getBody();
  }
}
