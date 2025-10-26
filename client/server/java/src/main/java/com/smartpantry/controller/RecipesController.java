package com.smartpantry.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.*;

@RestController
@RequestMapping("/api/recipes")
public class RecipesController {
  @GetMapping("/suggest")
  public ResponseEntity<?> suggest(@RequestParam(value = "ingredients", required = false) String ingredients) {
    var list = new ArrayList<Map<String,Object>>();
    if (ingredients != null && !ingredients.isBlank()) {
      var parts = Arrays.stream(ingredients.split(",")).map(String::trim).filter(s->!s.isEmpty()).map(String::toLowerCase).toArray(String[]::new);
      var s = String.join(",", parts);
      if (s.contains("egg") && s.contains("bread")) list.add(Map.of("title","French Toast","url","https://www.allrecipes.com/recipe/7016/french-toast-i/","ingredients",List.of("egg","bread","milk")));
      if (s.contains("tomato") && s.contains("pasta")) list.add(Map.of("title","Simple Tomato Pasta","url","https://www.allrecipes.com/recipe/23431/pasta-with-fresh-tomatoes/","ingredients",List.of("pasta","tomato","garlic")));
    }
    if (list.isEmpty()) list.add(Map.of("title","Mixed Veg Stir-fry","url","https://www.allrecipes.com/recipe/229960/quick-vegetable-stir-fry/","ingredients",List.of("vegetables","soy sauce","garlic")));
    return ResponseEntity.ok(Map.of("recipes", list));
  }
}
