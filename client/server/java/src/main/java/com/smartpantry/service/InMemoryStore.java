package com.smartpantry.service;

import com.smartpantry.model.Models.User;
import com.smartpantry.model.Models.InventoryItem;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.*;

public class InMemoryStore {
  public static final ConcurrentHashMap<String, User> users = new ConcurrentHashMap<>();
  // userId -> (itemId -> item)
  public static final ConcurrentHashMap<String, ConcurrentHashMap<String, InventoryItem>> items = new ConcurrentHashMap<>();

  public static User createUser(String id, String email, String role, String passwordHash, String salt) {
    User u = new User();
    u.id = id;
    u.email = email;
    u.role = role;
    u.passwordHash = passwordHash;
    u.salt = salt;
    u.createdAt = Instant.now();
    users.put(id, u);
    return u;
  }

  public static Collection<InventoryItem> listItems(String userId) {
    var map = items.getOrDefault(userId, new ConcurrentHashMap<>());
    return new ArrayList<>(map.values());
  }

  public static InventoryItem saveItem(InventoryItem it) {
    it.createdAt = it.createdAt == null ? Instant.now() : it.createdAt;
    it.updatedAt = Instant.now();
    items.computeIfAbsent(it.userId, k -> new ConcurrentHashMap<>()).put(it.id, it);
    return it;
  }

  public static InventoryItem getItem(String userId, String id) {
    return items.getOrDefault(userId, new ConcurrentHashMap<>()).get(id);
  }

  public static void deleteItem(String userId, String id) {
    var map = items.get(userId);
    if (map != null) map.remove(id);
  }
}
