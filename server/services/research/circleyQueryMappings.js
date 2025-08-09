/**
 * Circle Y Saddles Database Query Mappings
 * Maps research domains to relevant SQL queries for contextual data
 */

const QUERY_MAPPINGS = {
  // Manufacturing Optimization Queries
  manufacturing_optimization: {
    name: 'Manufacturing Optimization',
    description: 'Production efficiency, job completion times, and bottlenecks',
    queries: {
      production_efficiency: {
        name: 'Production Efficiency Analysis',
        sql: `
          SELECT 
            jh.job_number,
            jh.product_code,
            jh.start_date,
            jh.completion_date,
            jh.scheduled_completion,
            DATEDIFF(day, jh.start_date, jh.completion_date) as actual_days,
            DATEDIFF(day, jh.start_date, jh.scheduled_completion) as scheduled_days,
            CASE 
              WHEN jh.completion_date <= jh.scheduled_completion THEN 'On Time'
              ELSE 'Late'
            END as delivery_status,
            jh.quantity_ordered,
            jh.quantity_completed,
            pl.brand_name,
            pl.product_line_name
          FROM job_header jh
          LEFT JOIN product_lines pl ON jh.product_line_id = pl.id
          WHERE jh.start_date >= DATEADD(month, -6, GETDATE())
            AND jh.status = 'COMPLETED'
          ORDER BY jh.completion_date DESC
        `,
        description: 'Job completion times and on-time delivery rates'
      },
      production_bottlenecks: {
        name: 'Production Bottlenecks',
        sql: `
          SELECT 
            work_center,
            COUNT(*) as active_jobs,
            AVG(DATEDIFF(day, start_date, GETDATE())) as avg_days_in_progress,
            SUM(quantity_ordered - quantity_completed) as units_pending,
            MIN(scheduled_completion) as earliest_due_date
          FROM job_header
          WHERE status IN ('IN_PROGRESS', 'SCHEDULED')
          GROUP BY work_center
          HAVING COUNT(*) > 5
          ORDER BY active_jobs DESC, avg_days_in_progress DESC
        `,
        description: 'Identifies work centers with high job volumes and delays'
      },
      monthly_production_trends: {
        name: 'Monthly Production Trends',
        sql: `
          SELECT 
            DATEPART(year, completion_date) as year,
            DATEPART(month, completion_date) as month,
            COUNT(*) as jobs_completed,
            SUM(quantity_completed) as units_produced,
            AVG(DATEDIFF(day, start_date, completion_date)) as avg_cycle_time,
            COUNT(CASE WHEN completion_date <= scheduled_completion THEN 1 END) * 100.0 / COUNT(*) as on_time_percentage
          FROM job_header
          WHERE completion_date >= DATEADD(year, -1, GETDATE())
            AND status = 'COMPLETED'
          GROUP BY DATEPART(year, completion_date), DATEPART(month, completion_date)
          ORDER BY year DESC, month DESC
        `,
        description: 'Production volume and efficiency trends over time'
      }
    }
  },

  // Quality & Automation Queries
  quality_automation: {
    name: 'Quality & Automation',
    description: 'Defect rates, rework orders, and quality metrics',
    queries: {
      defect_analysis: {
        name: 'Defect and Rework Analysis',
        sql: `
          SELECT 
            jh.product_code,
            pl.brand_name,
            pl.product_line_name,
            COUNT(DISTINCT jh.job_number) as total_jobs,
            COUNT(DISTINCT CASE WHEN jh.is_rework = 1 THEN jh.job_number END) as rework_jobs,
            COUNT(DISTINCT CASE WHEN jh.is_rework = 1 THEN jh.job_number END) * 100.0 / COUNT(DISTINCT jh.job_number) as rework_percentage,
            SUM(CASE WHEN jh.is_rework = 1 THEN jh.quantity_ordered ELSE 0 END) as rework_units,
            AVG(CASE WHEN jh.is_rework = 1 THEN DATEDIFF(day, jh.start_date, jh.completion_date) END) as avg_rework_time
          FROM job_header jh
          LEFT JOIN product_lines pl ON jh.product_line_id = pl.id
          WHERE jh.start_date >= DATEADD(month, -6, GETDATE())
          GROUP BY jh.product_code, pl.brand_name, pl.product_line_name
          HAVING COUNT(DISTINCT jh.job_number) >= 5
          ORDER BY rework_percentage DESC
        `,
        description: 'Products with highest rework rates and quality issues'
      },
      quality_trends: {
        name: 'Quality Trends Over Time',
        sql: `
          SELECT 
            DATEPART(year, jh.completion_date) as year,
            DATEPART(month, jh.completion_date) as month,
            COUNT(DISTINCT jh.job_number) as total_jobs,
            COUNT(DISTINCT CASE WHEN jh.is_rework = 1 THEN jh.job_number END) as rework_jobs,
            COUNT(DISTINCT CASE WHEN jh.quality_hold = 1 THEN jh.job_number END) as quality_holds,
            AVG(jh.quality_score) as avg_quality_score
          FROM job_header jh
          WHERE jh.completion_date >= DATEADD(year, -1, GETDATE())
            AND jh.status = 'COMPLETED'
          GROUP BY DATEPART(year, jh.completion_date), DATEPART(month, jh.completion_date)
          ORDER BY year DESC, month DESC
        `,
        description: 'Monthly quality metrics and improvement trends'
      }
    }
  },

  // Supply Chain Queries
  supply_chain: {
    name: 'Supply Chain Management',
    description: 'Inventory levels, lead times, and supplier performance',
    queries: {
      inventory_analysis: {
        name: 'Current Inventory Levels',
        sql: `
          SELECT 
            i.product_code,
            i.product_description,
            pl.brand_name,
            i.quantity_on_hand,
            i.quantity_on_order,
            i.quantity_allocated,
            i.quantity_available,
            i.reorder_point,
            i.reorder_quantity,
            CASE 
              WHEN i.quantity_available < i.reorder_point THEN 'Below Reorder'
              WHEN i.quantity_available < (i.reorder_point * 1.5) THEN 'Low Stock'
              ELSE 'Adequate'
            END as stock_status,
            i.last_purchase_date,
            i.last_sale_date,
            DATEDIFF(day, i.last_sale_date, GETDATE()) as days_since_last_sale
          FROM inventory i
          LEFT JOIN product_lines pl ON i.product_line_id = pl.id
          WHERE i.is_active = 1
          ORDER BY stock_status, i.quantity_available
        `,
        description: 'Real-time inventory levels and reorder status'
      },
      supplier_performance: {
        name: 'Supplier Lead Time Analysis',
        sql: `
          SELECT 
            s.supplier_name,
            s.supplier_code,
            COUNT(DISTINCT po.purchase_order_number) as total_orders,
            AVG(DATEDIFF(day, po.order_date, po.received_date)) as avg_lead_time_days,
            MIN(DATEDIFF(day, po.order_date, po.received_date)) as min_lead_time,
            MAX(DATEDIFF(day, po.order_date, po.received_date)) as max_lead_time,
            COUNT(CASE WHEN po.received_date > po.expected_date THEN 1 END) * 100.0 / COUNT(*) as late_delivery_percentage,
            SUM(po.order_total) as total_spend
          FROM suppliers s
          JOIN purchase_orders po ON s.supplier_id = po.supplier_id
          WHERE po.order_date >= DATEADD(year, -1, GETDATE())
            AND po.status = 'RECEIVED'
          GROUP BY s.supplier_name, s.supplier_code
          HAVING COUNT(DISTINCT po.purchase_order_number) >= 5
          ORDER BY avg_lead_time_days DESC
        `,
        description: 'Supplier reliability and lead time performance'
      },
      material_shortage_risk: {
        name: 'Material Shortage Risk Assessment',
        sql: `
          SELECT 
            i.product_code,
            i.product_description,
            i.quantity_available,
            i.reorder_point,
            AVG(sh.quantity_shipped) as avg_monthly_usage,
            i.quantity_available / NULLIF(AVG(sh.quantity_shipped), 0) as months_of_supply,
            MAX(po.lead_time_days) as typical_lead_time,
            CASE 
              WHEN i.quantity_available / NULLIF(AVG(sh.quantity_shipped), 0) < 1 THEN 'Critical'
              WHEN i.quantity_available / NULLIF(AVG(sh.quantity_shipped), 0) < 2 THEN 'High Risk'
              WHEN i.quantity_available / NULLIF(AVG(sh.quantity_shipped), 0) < 3 THEN 'Medium Risk'
              ELSE 'Low Risk'
            END as shortage_risk
          FROM inventory i
          LEFT JOIN (
            SELECT product_code, AVG(quantity_shipped) as quantity_shipped
            FROM shipping_history
            WHERE ship_date >= DATEADD(month, -6, GETDATE())
            GROUP BY product_code
          ) sh ON i.product_code = sh.product_code
          LEFT JOIN (
            SELECT product_code, AVG(DATEDIFF(day, order_date, received_date)) as lead_time_days
            FROM purchase_order_details pod
            JOIN purchase_orders po ON pod.purchase_order_id = po.id
            WHERE po.received_date IS NOT NULL
            GROUP BY product_code
          ) po ON i.product_code = po.product_code
          WHERE i.is_active = 1
            AND i.product_type = 'RAW_MATERIAL'
          ORDER BY shortage_risk, months_of_supply
        `,
        description: 'Materials at risk of stockout based on usage and lead times'
      }
    }
  },

  // Market Analysis Queries
  market_analysis: {
    name: 'Market Analysis',
    description: 'Sales trends, popular products, and customer segments',
    queries: {
      sales_trends: {
        name: 'Sales Performance Trends',
        sql: `
          SELECT 
            DATEPART(year, ob.order_date) as year,
            DATEPART(month, ob.order_date) as month,
            COUNT(DISTINCT ob.order_number) as order_count,
            COUNT(DISTINCT ob.customer_id) as unique_customers,
            SUM(ob.order_total) as total_revenue,
            AVG(ob.order_total) as avg_order_value,
            SUM(ob.quantity_ordered) as units_sold
          FROM order_bookings ob
          WHERE ob.order_date >= DATEADD(year, -2, GETDATE())
            AND ob.order_status NOT IN ('CANCELLED', 'VOID')
          GROUP BY DATEPART(year, ob.order_date), DATEPART(month, ob.order_date)
          ORDER BY year DESC, month DESC
        `,
        description: 'Monthly sales revenue and order volume trends'
      },
      top_products: {
        name: 'Best Selling Products',
        sql: `
          SELECT TOP 50
            ob.product_code,
            MAX(ob.product_description) as product_description,
            pl.brand_name,
            pl.product_line_name,
            COUNT(DISTINCT ob.order_number) as order_count,
            SUM(ob.quantity_ordered) as total_units_sold,
            SUM(ob.line_total) as total_revenue,
            AVG(ob.unit_price) as avg_selling_price,
            COUNT(DISTINCT ob.customer_id) as unique_customers
          FROM order_bookings ob
          LEFT JOIN product_lines pl ON ob.product_line_id = pl.id
          WHERE ob.order_date >= DATEADD(month, -12, GETDATE())
            AND ob.order_status NOT IN ('CANCELLED', 'VOID')
          GROUP BY ob.product_code, pl.brand_name, pl.product_line_name
          ORDER BY total_revenue DESC
        `,
        description: 'Top products by revenue and unit sales'
      },
      customer_segments: {
        name: 'Customer Segmentation Analysis',
        sql: `
          SELECT 
            c.customer_type,
            c.region,
            COUNT(DISTINCT c.customer_id) as customer_count,
            COUNT(DISTINCT ob.order_number) as total_orders,
            SUM(ob.order_total) as total_revenue,
            AVG(ob.order_total) as avg_order_value,
            SUM(ob.order_total) / COUNT(DISTINCT c.customer_id) as revenue_per_customer,
            COUNT(DISTINCT ob.order_number) / COUNT(DISTINCT c.customer_id) as orders_per_customer
          FROM customers c
          LEFT JOIN order_bookings ob ON c.customer_id = ob.customer_id
            AND ob.order_date >= DATEADD(year, -1, GETDATE())
            AND ob.order_status NOT IN ('CANCELLED', 'VOID')
          WHERE c.is_active = 1
          GROUP BY c.customer_type, c.region
          ORDER BY total_revenue DESC
        `,
        description: 'Revenue and order patterns by customer segment'
      },
      seasonal_patterns: {
        name: 'Seasonal Sales Patterns',
        sql: `
          SELECT 
            DATEPART(month, ob.order_date) as month_number,
            DATENAME(month, ob.order_date) as month_name,
            pl.product_line_name,
            COUNT(DISTINCT ob.order_number) as order_count,
            SUM(ob.quantity_ordered) as units_sold,
            SUM(ob.line_total) as revenue,
            AVG(ob.line_total) as avg_order_line_value
          FROM order_bookings ob
          LEFT JOIN product_lines pl ON ob.product_line_id = pl.id
          WHERE ob.order_date >= DATEADD(year, -3, GETDATE())
            AND ob.order_status NOT IN ('CANCELLED', 'VOID')
          GROUP BY DATEPART(month, ob.order_date), DATENAME(month, ob.order_date), pl.product_line_name
          ORDER BY month_number, revenue DESC
        `,
        description: 'Monthly seasonality patterns by product line'
      }
    }
  },

  // Product Innovation Queries
  product_innovation: {
    name: 'Product Innovation',
    description: 'Product line performance and new vs legacy products',
    queries: {
      product_lifecycle: {
        name: 'Product Lifecycle Analysis',
        sql: `
          SELECT 
            p.product_code,
            p.product_description,
            pl.brand_name,
            pl.product_line_name,
            p.introduction_date,
            DATEDIFF(month, p.introduction_date, GETDATE()) as months_since_launch,
            CASE 
              WHEN DATEDIFF(month, p.introduction_date, GETDATE()) <= 6 THEN 'New Launch'
              WHEN DATEDIFF(month, p.introduction_date, GETDATE()) <= 24 THEN 'Growth'
              WHEN DATEDIFF(month, p.introduction_date, GETDATE()) <= 60 THEN 'Mature'
              ELSE 'Legacy'
            END as lifecycle_stage,
            COUNT(DISTINCT ob.order_number) as total_orders,
            SUM(ob.quantity_ordered) as total_units,
            SUM(ob.line_total) as lifetime_revenue,
            AVG(ob.line_total) as avg_order_value,
            MAX(ob.order_date) as last_order_date,
            DATEDIFF(day, MAX(ob.order_date), GETDATE()) as days_since_last_order
          FROM products p
          LEFT JOIN product_lines pl ON p.product_line_id = pl.id
          LEFT JOIN order_bookings ob ON p.product_code = ob.product_code
          WHERE p.is_active = 1
          GROUP BY p.product_code, p.product_description, pl.brand_name, pl.product_line_name, p.introduction_date
          ORDER BY lifecycle_stage, lifetime_revenue DESC
        `,
        description: 'Product performance across lifecycle stages'
      },
      innovation_success_rate: {
        name: 'New Product Success Analysis',
        sql: `
          SELECT 
            pl.brand_name,
            pl.product_line_name,
            COUNT(DISTINCT p.product_code) as total_new_products,
            COUNT(DISTINCT CASE WHEN first_year_revenue > 50000 THEN p.product_code END) as successful_launches,
            COUNT(DISTINCT CASE WHEN first_year_revenue > 50000 THEN p.product_code END) * 100.0 / COUNT(DISTINCT p.product_code) as success_rate,
            AVG(first_year_revenue) as avg_first_year_revenue,
            MAX(first_year_revenue) as best_performer_revenue
          FROM (
            SELECT 
              p.product_code,
              p.product_line_id,
              p.introduction_date,
              SUM(CASE 
                WHEN ob.order_date <= DATEADD(year, 1, p.introduction_date) 
                THEN ob.line_total 
                ELSE 0 
              END) as first_year_revenue
            FROM products p
            LEFT JOIN order_bookings ob ON p.product_code = ob.product_code
            WHERE p.introduction_date >= DATEADD(year, -3, GETDATE())
            GROUP BY p.product_code, p.product_line_id, p.introduction_date
          ) p
          LEFT JOIN product_lines pl ON p.product_line_id = pl.id
          GROUP BY pl.brand_name, pl.product_line_name
          ORDER BY success_rate DESC
        `,
        description: 'Success rate of new product launches by brand'
      },
      product_cannibalization: {
        name: 'Product Cannibalization Analysis',
        sql: `
          WITH ProductSales AS (
            SELECT 
              ob.product_code,
              pl.product_line_name,
              DATEPART(year, ob.order_date) as year,
              DATEPART(quarter, ob.order_date) as quarter,
              SUM(ob.quantity_ordered) as units_sold,
              SUM(ob.line_total) as revenue
            FROM order_bookings ob
            LEFT JOIN product_lines pl ON ob.product_line_id = pl.id
            WHERE ob.order_date >= DATEADD(year, -2, GETDATE())
              AND ob.order_status NOT IN ('CANCELLED', 'VOID')
            GROUP BY ob.product_code, pl.product_line_name, DATEPART(year, ob.order_date), DATEPART(quarter, ob.order_date)
          )
          SELECT 
            curr.product_line_name,
            curr.year,
            curr.quarter,
            COUNT(DISTINCT curr.product_code) as active_products,
            SUM(curr.revenue) as total_revenue,
            SUM(curr.revenue) - SUM(prev.revenue) as revenue_change,
            (SUM(curr.revenue) - SUM(prev.revenue)) / NULLIF(SUM(prev.revenue), 0) * 100 as revenue_growth_pct
          FROM ProductSales curr
          LEFT JOIN ProductSales prev 
            ON curr.product_line_name = prev.product_line_name 
            AND curr.product_code = prev.product_code
            AND prev.year = curr.year - 1 
            AND prev.quarter = curr.quarter
          GROUP BY curr.product_line_name, curr.year, curr.quarter
          ORDER BY curr.year DESC, curr.quarter DESC, total_revenue DESC
        `,
        description: 'Impact of new products on existing product sales'
      }
    }
  }
};

// Helper function to get queries for a specific domain
function getQueriesForDomain(domainKey) {
  const domain = QUERY_MAPPINGS[domainKey];
  if (!domain) {
    return null;
  }
  
  return {
    name: domain.name,
    description: domain.description,
    queries: Object.entries(domain.queries).map(([key, query]) => ({
      key,
      ...query
    }))
  };
}

// Helper function to get all available domains
function getAllDomains() {
  return Object.entries(QUERY_MAPPINGS).map(([key, domain]) => ({
    key,
    name: domain.name,
    description: domain.description,
    queryCount: Object.keys(domain.queries).length
  }));
}

// Helper function to format query results for AI consumption
function formatQueryResultsForAI(domain, queryKey, results) {
  const domainInfo = QUERY_MAPPINGS[domain];
  const queryInfo = domainInfo?.queries[queryKey];
  
  if (!queryInfo) {
    return null;
  }
  
  return {
    context: `Circle Y Saddles Database Query Results`,
    domain: domainInfo.name,
    query: queryInfo.name,
    description: queryInfo.description,
    resultCount: results.length,
    data: results,
    insights: generateInsights(domain, queryKey, results)
  };
}

// Generate basic insights from query results
function generateInsights(domain, queryKey, results) {
  const insights = [];
  
  // Add domain-specific insight generation logic here
  if (results.length === 0) {
    insights.push('No data available for the specified time period.');
    return insights;
  }
  
  // Manufacturing insights
  if (domain === 'manufacturing_optimization') {
    if (queryKey === 'production_efficiency' && results.length > 0) {
      const onTimeCount = results.filter(r => r.delivery_status === 'On Time').length;
      const onTimeRate = (onTimeCount / results.length * 100).toFixed(1);
      insights.push(`On-time delivery rate: ${onTimeRate}%`);
      
      const avgCycleTime = results.reduce((sum, r) => sum + (r.actual_days || 0), 0) / results.length;
      insights.push(`Average production cycle time: ${avgCycleTime.toFixed(1)} days`);
    }
  }
  
  // Market analysis insights
  if (domain === 'market_analysis') {
    if (queryKey === 'sales_trends' && results.length > 0) {
      const latestMonth = results[0];
      const yearAgoMonth = results.find(r => 
        r.year === latestMonth.year - 1 && r.month === latestMonth.month
      );
      
      if (yearAgoMonth) {
        const yoyGrowth = ((latestMonth.total_revenue - yearAgoMonth.total_revenue) / yearAgoMonth.total_revenue * 100).toFixed(1);
        insights.push(`Year-over-year revenue growth: ${yoyGrowth}%`);
      }
    }
  }
  
  return insights;
}

module.exports = {
  QUERY_MAPPINGS,
  getQueriesForDomain,
  getAllDomains,
  formatQueryResultsForAI
};