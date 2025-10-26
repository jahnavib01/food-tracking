package com.smartpantry.model;

import java.time.Instant;

public class Models {
  public static class User {
    public String id;
    public String email;
    public String role; // "user" or "admin"
    public String passwordHash;
    public String salt;
    public Instant createdAt;
  }

  public static class InventoryItem {
    public String id;
    public String userId;
    public String name;
    public int quantity;
    public String unit;
    public String expiry; // ISO
    public String category;
    public String barcode;
    public String notes;
    public Instant createdAt;
    public Instant updatedAt;
  }
}
