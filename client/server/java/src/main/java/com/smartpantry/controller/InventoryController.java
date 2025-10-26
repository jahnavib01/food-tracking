package com.smartpantry.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import com.smartpantry.service.InMemoryStore;
import com.smartpantry.model.Models.InventoryItem;
import com.smartpantry.security.JwtUtil;
import io.jsonwebtoken.Claims;

import java.util.*;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

  static String getUserIdFromAuth(String auth) {
    if (auth == null || !auth.startsWith("Bearer ")) return null;
    try {
      Claims c = JwtUtil.parseToken(auth.substring(7));
      return c.getSubject();
    } catch (Exception e) { return null; }
  }

  @GetMapping("")
  public ResponseEntity<?> list(@RequestHeader(value = "Authorization", required = false) String auth) {
    String userId = getUserIdFromAuth(auth);
    if (userId == null) return ResponseEntity.status(401).body(Map.of("error","Unauthorized"));
    var items = InMemoryStore.listItems(userId);
    var sorted = new ArrayList<>(items);
    sorted.sort(Comparator.comparing(i -> i.expiry));
    return ResponseEntity.ok(Map.of("items", sorted));
  }

  @PostMapping("")
  public ResponseEntity<?> create(@RequestHeader(value = "Authorization", required = false) String auth, @RequestBody InventoryItem it) {
    String userId = getUserIdFromAuth(auth);
    if (userId == null) return ResponseEntity.status(401).body(Map.of("error","Unauthorized"));
    if (it.name == null || it.name.isBlank()) return ResponseEntity.badRequest().body(Map.of("error","Missing name"));
    it.id = UUID.randomUUID().toString();
    it.userId = userId;
    it.createdAt = it.createdAt == null ? java.time.Instant.now() : it.createdAt;
    it.updatedAt = java.time.Instant.now();
    InMemoryStore.saveItem(it);
    return ResponseEntity.status(201).body(it);
  }

  @PutMapping("/{id}")
  public ResponseEntity<?> update(@RequestHeader(value = "Authorization", required = false) String auth, @PathVariable String id, @RequestBody Map<String,Object> body) {
    String userId = getUserIdFromAuth(auth);
    if (userId == null) return ResponseEntity.status(401).body(Map.of("error","Unauthorized"));
    var it = InMemoryStore.getItem(userId, id);
    if (it == null) return ResponseEntity.status(404).body(Map.of("error","Not found"));
    if (body.containsKey("name")) it.name = (String) body.get("name");
    if (body.containsKey("quantity")) it.quantity = ((Number) body.get("quantity")).intValue();
    if (body.containsKey("expiry")) it.expiry = (String) body.get("expiry");
    it.updatedAt = java.time.Instant.now();
    InMemoryStore.saveItem(it);
    return ResponseEntity.ok(it);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<?> delete(@RequestHeader(value = "Authorization", required = false) String auth, @PathVariable String id) {
    String userId = getUserIdFromAuth(auth);
    if (userId == null) return ResponseEntity.status(401).body(Map.of("error","Unauthorized"));
    InMemoryStore.deleteItem(userId, id);
    return ResponseEntity.status(204).build();
  }

  @GetMapping("/stats")
  public ResponseEntity<?> stats(@RequestHeader(value = "Authorization", required = false) String auth) {
    String userId = getUserIdFromAuth(auth);
    if (userId == null) return ResponseEntity.status(401).body(Map.of("error","Unauthorized"));
    var list = InMemoryStore.listItems(userId);
    int expired = 0; int expiringSoon = 0; Map<String,Integer> cat = new HashMap<>();
    var now = java.time.Instant.now();
    int soonDays = Integer.parseInt(System.getenv().getOrDefault("EXPIRY_SOON_DAYS", "3"));
    for (var it : list) {
      var d = java.time.Instant.parse(it.expiry);
      if (d.isBefore(now)) expired++;
      long diff = java.time.Duration.between(now, d).toDays();
      if (diff >=0 && diff <= soonDays) expiringSoon++;
      cat.put(it.category, cat.getOrDefault(it.category, 0)+1);
    }
    return ResponseEntity.ok(Map.of("total", list.size(), "expired", expired, "expiringSoon", expiringSoon, "categoriesCount", cat));
  }
}
