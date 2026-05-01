package com.financ.financial.fixedcost;

import com.financ.financial.category.Category;
import com.financ.financial.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "fixed_costs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FixedCost {
}
