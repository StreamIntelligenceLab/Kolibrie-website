# Kolibrie Database

## Table of Contents

1. [Introduction](#introduction)
2. [System Architecture](#system-architecture)
3. [Getting Started](#getting-started)
4. [Example Queries](#example-queries)
   - [Average Salary Query](#average-salary-query)
   - [Minimum Salary Query](#minimum-salary-query)
   - [Sum of Salaries Grouped by Title](#sum-of-salaries-grouped-by-title)
   - [Concatenation of Names](#concatenation-of-names)
   - [Filtering by Author](#filtering-by-author)
   - [Simple SELECT Query](#simple-select-query)
   - [INSERT Query Example](#insert-query-example)
   - [Nested SELECT Query](#nested-select-query)
5. [Additional Examples](#additional-examples)
   - [Simple SELECT (John & Alice)](#simple-select-john--alice)
   - [Using a User-Defined Function (UDF)](#using-a-user-defined-function-udf)
   - [VALUES Clause Example](#values-clause-example)
   - [Advanced Join Example](#advanced-join-example)
   - [Single-Threaded Processing Example](#single-threaded-processing-example)
   - [Multi-Threaded Processing Example](#multi-threaded-processing-example)
   - [CUDA-Enabled Processing Example](#cuda-enabled-processing-example)

---

## Introduction

Welcome to the comprehensive documentation of the **Kolibrie Database Engine**, a high-performance, scalable, and extensible system designed to manage and query RDF (Resource Description Framework) data using the SPARQL query language. This documentation aims to provide an in-depth understanding of the engine's architecture, data structures, indexing mechanisms, query parsing, execution strategies, and performance optimizations. Whether you are a database architect, a software developer, or an academic researcher, this guide will equip you with the knowledge required to effectively utilize and extend the database engine.

---

## System Architecture

The Kolibrie Database Engine is architected to efficiently handle large-scale RDF data, enabling rapid query processing and seamless data ingestion. The system is modular, comprising several interconnected components that work in harmony to provide robust data management and querying capabilities.

### Core Components

1. **Triple Store**: The foundational storage mechanism that holds RDF triples (subject-predicate-object).
2. **Dictionary**: A bidirectional mapping system that encodes and decodes string terms to compact numerical representations, optimizing storage and comparison operations.
3. **Index Manager**: Manages multiple indexes to accelerate query processing by providing quick access paths to triples based on different index types.
4. **Query Parser**: Utilizes the Nom parsing library to interpret and validate SPARQL queries, transforming them into executable plans.
5. **Query Executor**: Executes parsed queries using optimized algorithms, leveraging parallelism and SIMD instructions for enhanced performance.
6. **User-Defined Functions (UDFs)**: Allows the extension of query capabilities by enabling custom functions to be integrated into the query processing pipeline.
7. **Stream Manager**: Handles real-time data ingestion and sliding window mechanisms to support dynamic data scenarios.

---

## Getting Started

Each example uses the following imports:

```rust
use kolibrie::parser::*;
use kolibrie::sparql_database::*;
```

Before running any example, ensure that Kolibrie is properly installed and configured.

---

## Example Queries

### Average Salary Query

This example calculates the average annual salary from employee RDF data.

```rust
use kolibrie::parser::*;
use kolibrie::sparql_database::*;

fn avg() {
    let rdf_data = r#"
    <?xml version="1.0" encoding="UTF-8"?>
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
             xmlns:foaf="http://xmlns.com/foaf/0.1/"
             xmlns:ds="https://data.cityofchicago.org/resource/xzkq-xp2w/">
      <rdf:Description rdf:about="http://example.org/employee1">
            <foaf:name>Employee1</foaf:name>
            <foaf:title>Developer</foaf:title>
            <ds:annual_salary>73681</ds:annual_salary>
      </rdf:Description>
      <rdf:Description rdf:about="http://example.org/employee2">
            <foaf:name>Employee2</foaf:name>
            <foaf:title>Developer</foaf:title>
            <ds:annual_salary>83504</ds:annual_salary>
      </rdf:Description>
      <rdf:Description rdf:about="http://example.org/employee3">
            <foaf:name>Employee3</foaf:name>
            <foaf:title>Developer</foaf:title>
            <ds:annual_salary>90065</ds:annual_salary>
      </rdf:Description>
      <rdf:Description rdf:about="http://example.org/employee4">
            <foaf:name>Employee4</foaf:name>
            <foaf:title>Manager</foaf:title>
            <ds:annual_salary>67751</ds:annual_salary>
      </rdf:Description>
    </rdf:RDF>
    "#;
    let mut database = SparqlDatabase::new();
    database.parse_rdf(rdf_data);

    let sparql = r#"
    PREFIX ds: <https://data.cityofchicago.org/resource/xzkq-xp2w/> 
    SELECT AVG(?salary) AS ?average_salary 
    WHERE {
        ?employee ds:annual_salary ?salary
    } 
    GROUPBY ?average_salary"#;

    let results = execute_query(sparql, &mut database);

    println!("Results:");
    for result in results {
        if let [avg_salary] = &result[..] {
            println!("AVG(?salary) = {}", avg_salary);
        }
    }
}

fn main() {
    avg();
}
```

---

### Minimum Salary Query

This query retrieves the minimum annual salary.

```rust
use kolibrie::parser::*;
use kolibrie::sparql_database::*;

fn min_aggregate() {
    let rdf_data = r#"
    <?xml version="1.0" encoding="UTF-8"?>
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
             xmlns:foaf="http://xmlns.com/foaf/0.1/"
             xmlns:ds="https://data.cityofchicago.org/resource/xzkq-xp2w/">
      <rdf:Description rdf:about="http://example.org/employee1">
            <foaf:name>Employee1</foaf:name>
            <foaf:title>Developer</foaf:title>
            <ds:annual_salary>73681</ds:annual_salary>
      </rdf:Description>
      <rdf:Description rdf:about="http://example.org/employee2">
            <foaf:name>Employee2</foaf:name>
            <foaf:title>Developer</foaf:title>
            <ds:annual_salary>83504</ds:annual_salary>
      </rdf:Description>
      <rdf:Description rdf:about="http://example.org/employee3">
            <foaf:name>Employee3</foaf:name>
            <foaf:title>Developer</foaf:title>
            <ds:annual_salary>90065</ds:annual_salary>
      </rdf:Description>
      <rdf:Description rdf:about="http://example.org/employee4">
            <foaf:name>Employee4</foaf:name>
            <foaf:title>Manager</foaf:title>
            <ds:annual_salary>67751</ds:annual_salary>
      </rdf:Description>
    </rdf:RDF>
    "#;
    let mut database = SparqlDatabase::new();
    database.parse_rdf(rdf_data);

    let sparql = r#"PREFIX ds: <https://data.cityofchicago.org/resource/xzkq-xp2w/> SELECT MIN(?salary) AS ?minimum_salary WHERE {?employee ds:annual_salary ?salary} GROUPBY ?minimum_salary"#;

    let results = execute_query(sparql, &mut database);

    println!("Results:");
    for result in results {
        if let [salary] = &result[..] {
            println!("MIN(?salary) = {}", salary);
        }
    }
}

fn main() {
    min_aggregate();
}
```

---

### Sum of Salaries Grouped by Title

This example groups employees by title and sums their salaries.

```rust
use kolibrie::parser::*;
use kolibrie::sparql_database::*;

fn sum_aggregate() {
    let rdf_data = r#"
    <?xml version="1.0" encoding="UTF-8"?>
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
             xmlns:foaf="http://xmlns.com/foaf/0.1/"
             xmlns:ds="https://data.cityofchicago.org/resource/xzkq-xp2w/">
      <rdf:Description rdf:about="http://example.org/employee1">
            <foaf:name>Employee1</foaf:name>
            <foaf:title>Developer</foaf:title>
            <ds:annual_salary>73681</ds:annual_salary>
      </rdf:Description>
      <rdf:Description rdf:about="http://example.org/employee2">
            <foaf:name>Employee2</foaf:name>
            <foaf:title>Developer</foaf:title>
            <ds:annual_salary>83504</ds:annual_salary>
      </rdf:Description>
      <rdf:Description rdf:about="http://example.org/employee3">
            <foaf:name>Employee3</foaf:name>
            <foaf:title>Developer</foaf:title>
            <ds:annual_salary>90065</ds:annual_salary>
      </rdf:Description>
      <rdf:Description rdf:about="http://example.org/employee4">
            <foaf:name>Employee4</foaf:name>
            <foaf:title>Manager</foaf:title>
            <ds:annual_salary>67751</ds:annual_salary>
      </rdf:Description>
    </rdf:RDF>
    "#;
    let mut database = SparqlDatabase::new();
    database.parse_rdf(rdf_data);

    let sparql = r#"PREFIX foaf: <http://xmlns.com/foaf/0.1/> 
    PREFIX ds: <https://data.cityofchicago.org/resource/xzkq-xp2w/> 
    SELECT ?title SUM(?salary) AS ?total_salary 
    WHERE {
        ?employee foaf:title ?title . 
        ?employee ds:annual_salary ?salary
    } GROUPBY ?title"#;

    let results = execute_query(sparql, &mut database);

    println!("Results:");
    for result in results {
        if let [title, salary] = &result[..] {
            println!("?title = {} SUM(?salary) = {}", title, salary);
        }
    }
}

fn main() {
    sum_aggregate();
}
```

---

### Concatenation of Names

This query demonstrates how to concatenate first and last names.

```rust
use kolibrie::parser::*;
use kolibrie::sparql_database::*;

fn concat() {
    let rdf_data = r#"
    <?xml version="1.0" encoding="UTF-8"?>
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
             xmlns:foaf="http://xmlns.com/foaf/0.1/">
      <rdf:Description rdf:about="_:a">
        <foaf:givenName>John</foaf:givenName>
        <foaf:surname>Doe</foaf:surname>
      </rdf:Description>
    </rdf:RDF>
    "#;
    let mut database = SparqlDatabase::new();
    database.parse_rdf(rdf_data);

    let sparql = r#"
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    SELECT ?name
    WHERE {
        ?P foaf:givenName ?G .
        ?P foaf:surname ?S
        BIND(CONCAT(?G, " ", ?S) AS ?name)
    }"#;

    let results = execute_query(sparql, &mut database);

    println!("Results: {:?}", results);
}

fn main() {
    concat();
}
```

---

### Filtering by Author

This example filters books by a specific author.

```rust
use kolibrie::parser::*;
use kolibrie::sparql_database::*;

fn filter_char() {
    let rdf_data = r##"
    <?xml version="1.0"?>
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
             xmlns:dc="http://purl.org/dc/elements/1.1/">
      <rdf:Description rdf:about="#book1">
        <dc:title>To Kill a Mockingbird</dc:title>
        <dc:creator>Harper Lee</dc:creator>
        <dc:date>1960</dc:date>
      </rdf:Description>
      <rdf:Description rdf:about="#book2">
        <dc:title>Pride and Prejudice</dc:title>
        <dc:creator>Jane Austen</dc:creator>
        <dc:date>1813</dc:date>
      </rdf:Description>
    </rdf:RDF>
    "##;
    let mut database = SparqlDatabase::new();
    database.parse_rdf(rdf_data);

    let sparql = r#"
    PREFIX dc: <http://purl.org/dc/elements/1.1/> 
    SELECT ?title ?author 
    WHERE {
      ?book dc:title ?title . 
      ?book dc:creator ?author 
      FILTER (?author = "Jane Austen")
    }"#;

    let results = execute_query(sparql, &mut database);

    println!("Results:");
    for result in results {
        if let [title, author] = &result[..] {
            println!("?title = {} ?author = {}", title, author);
        }
    }
}

fn main() {
    filter_char();
}
```

---

### Simple SELECT Query

This example selects individuals with a specific occupation and prints both the query results and all stored triples.

```rust
use kolibrie::parser::*;
use kolibrie::sparql_database::*;

fn select() {
    let rdf_xml = r#"
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:ex="http://example.org/">
        <rdf:Description rdf:about="http://example.org/person1">
            <ex:hasOccupation>Engineer</ex:hasOccupation>
        </rdf:Description>
        <rdf:Description rdf:about="http://example.org/person2">
            <ex:hasOccupation>Artist</ex:hasOccupation>
        </rdf:Description>
        <rdf:Description rdf:about="http://example.org/person3">
            <ex:hasOccupation>Doctor</ex:hasOccupation>
        </rdf:Description>
    </rdf:RDF>
    "#;

    let mut database = SparqlDatabase::new();
    database.parse_rdf(rdf_xml);

    let sparql_query = r#"PREFIX ex: <http://example.org/> 
    SELECT ?person 
    WHERE {
        ?person ex:hasOccupation "Engineer"
    }"#;

    let results = execute_query(sparql_query, &mut database);

    println!("{:?}", results);

    // Optionally print out all triples
    for triple in &database.triples {
        let subject = database.dictionary.decode(triple.subject).unwrap_or_default();
        let predicate = database.dictionary.decode(triple.predicate).unwrap_or_default();
        let object = database.dictionary.decode(triple.object).unwrap_or_default();
        println!("Triple: ({}, {}, {})", subject, predicate, object);
    }
    
    for result in results {
        if let [person] = &result[..] {
            println!("{}", person);
        }
    }
}

fn main() {
    select();
}
```

---

### INSERT Query Example

This example shows how to insert a new triple into the RDF store.

```rust
use kolibrie::parser::*;
use kolibrie::sparql_database::*;

fn insert() {
    let rdf_xml = r#"
    <?xml version="1.0"?>
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
             xmlns:ex="http://example.org/">
      <rdf:Description rdf:about="http://example.org/JohnDoe">
        <ex:age>30</ex:age>
      </rdf:Description>
    </rdf:RDF>
    "#;

    let mut database = SparqlDatabase::new();
    database.parse_rdf(rdf_xml);

    let sparql_query = r#"PREFIX ex: <http://example.org/> 
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
    INSERT {
        <http://example.org/JohnDoe> ex:occupation "Software Developer"
    } WHERE {
        <http://example.org/JohnDoe> ex:age "30"
    }"#;

    let _results = execute_query(sparql_query, &mut database);

    database.debug_print_triples();
}

fn main() {
    insert();
}
```

---

### Nested SELECT Query

This nested query retrieves the names of friends connected to a specific person.

```rust
use kolibrie::parser::*;
use kolibrie::sparql_database::*;

fn simple_select() {
    let rdf_data = r#"
        <?xml version="1.0"?>
        <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
                 xmlns:ex="http://example.org/">
            <rdf:Description rdf:about="http://example.org/person/Alice">
                <ex:name>Alice</ex:name>
                <ex:knows rdf:resource="http://example.org/person/Bob"/>
            </rdf:Description>
            <rdf:Description rdf:about="http://example.org/person/Bob">
                <ex:name>Bob</ex:name>
                <ex:knows rdf:resource="http://example.org/person/Charlie"/>
            </rdf:Description>
            <rdf:Description rdf:about="http://example.org/person/Charlie">
                <ex:name>Charlie</ex:name>
            </rdf:Description>
        </rdf:RDF>
    "#;

    let mut database = SparqlDatabase::new();
    database.parse_rdf(rdf_data);

    let sparql = r#"
    PREFIX ex: <http://example.org/>
    SELECT ?friendName
    WHERE {
        ?person ex:name "Alice" .
        ?person ex:knows ?friend
        {
            SELECT ?friend ?friendName
            WHERE {
                ?friend ex:name ?friendName .
            }
        }
    }"#;

    let results = execute_query(sparql, &mut database);

    println!("Results: {:?}", results);
}

fn main() {
  simple_select();
}
```

---

## Additional Examples

Below are further examples demonstrating other features and processing modes.

### Simple SELECT (John & Alice)

A basic query that selects persons, their names, and ages from provided RDF data.

```rust
use kolibrie::parser::*;
use kolibrie::sparql_database::*;

// Simple select
fn simple_select() {
    let rdf_data = r#"
        <?xml version="1.0" encoding="UTF-8"?>
        <rdf:RDF
            xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
            xmlns:ex="http://example.org/">
        <rdf:Description rdf:about="http://example.org/John">
            <ex:name>John</ex:name>
            <ex:age>42</ex:age>
            <ex:knows rdf:resource="http://example.org/Alice"/>
        </rdf:Description>
        <rdf:Description rdf:about="http://example.org/Alice">
            <ex:name>Alice</ex:name>
            <ex:age>30</ex:age>
        </rdf:Description>
        </rdf:RDF>
    "#;

    let mut database = SparqlDatabase::new();
    database.parse_rdf(rdf_data);

    let sparql = r#"
    PREFIX ex: <http://example.org/>
    SELECT ?person ?name ?age
    WHERE {
        ?person ex:name ?name ; 
                ex:age ?age
    }"#;

    let results = execute_query(sparql, &mut database);

    println!("Results: {:?}", results);
}

fn main() {
  simple_select();
}
```

---

### Using a User-Defined Function (UDF)

This example registers a UDF that concatenates values with an underscore.

```rust
use kolibrie::parser::*;
use kolibrie::sparql_database::*;

// Adding udf
fn udf() {
    let rdf_data = r##"
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns:ex="http://example.com/">
    <rdf:Description rdf:about="http://example.com/resource1">
        <ex:predicate>value1</ex:predicate>
    </rdf:Description>
    <rdf:Description rdf:about="http://example.com/resource2">
        <ex:predicate>value2</ex:predicate>
    </rdf:Description>
</rdf:RDF>
    "##;
    let mut database = SparqlDatabase::new();
    database.parse_rdf(rdf_data);

    database.register_udf("concatValues", |args: Vec<&str>| {
		args.join("_") // Concatenates arguments with an underscore
	});

    let sparql = r#"
    PREFIX ex: <http://example.com/>
    SELECT ?subject ?result
    WHERE {
      ?subject ex:predicate ?object
      BIND(concatValues(?object, "suffix") AS ?result)
    }"#;

    let results = execute_query(sparql, &mut database);

    println!("Results:{:?}", results);
}

fn main() {
	udf();
}
```

---

### VALUES Clause Example

This query demonstrates the use of the VALUES clause.

```rust
use kolibrie::parser::*;
use kolibrie::sparql_database::*;

fn values() {
    let rdf_data = r#"
<?xml version="1.0" encoding="UTF-8"?>
<rdf:RDF
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
    xmlns:ex="http://example.org/">

    <rdf:Description rdf:about="http://example.org/person1">
        <ex:worksAt rdf:resource="http://example.org/companyA"/>
    </rdf:Description>

    <rdf:Description rdf:about="http://example.org/person2">
        <ex:worksAt rdf:resource="http://example.org/companyB"/>
    </rdf:Description>

    <rdf:Description rdf:about="http://example.org/person3">
        <ex:worksAt rdf:resource="http://example.org/companyA"/>
    </rdf:Description>

</rdf:RDF>
"#;
    let mut database = SparqlDatabase::new();
    database.parse_rdf(rdf_data);

    let sparql_query = r#"PREFIX ex: <http://example.org/> 
    SELECT ?person ?company 
    WHERE {
        ?person ex:worksAt ?company
    } VALUES ?company { 
        ex:companyA ex:companyB 
    }"#;

    let results = execute_query(sparql_query, &mut database);

    println!("Query Results:");
    for result in results {
        println!("{:?}", result);
    }
}

fn main() {
    values();
}
```

---

### Advanced Join Example

This example demonstrates a join across multiple RDF descriptions.

```rust
use kolibrie::parser::*;
use kolibrie::sparql_database::*;

// A little bit advanced join
fn advanced_join() {
    let rdf_data = r#"
        <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
                 xmlns:ex="http://example.org/">
          <rdf:Description rdf:about="http://example.org/peter">
            <ex:worksAt rdf:resource="http://example.org/kulak"/>
          </rdf:Description>
          <rdf:Description rdf:about="http://example.org/kulak">
            <ex:located rdf:resource="http://example.org/kortrijk"/>
            <ex:zipcode>8050</ex:zipcode>
          </rdf:Description>
          <rdf:Description rdf:about="http://example.org/charlotte">
            <ex:worksAt rdf:resource="http://example.org/ughent"/>
          </rdf:Description>
          <rdf:Description rdf:about="http://example.org/ughent">
            <ex:located rdf:resource="http://example.org/ghent"/>
            <ex:zipcode>9000</ex:zipcode>
          </rdf:Description>
        </rdf:RDF>
    "#;

    let mut database = SparqlDatabase::new();
    database.parse_rdf(rdf_data);

    let sparql = r#"PREFIX ex: <http://example.org/> 
    SELECT ?person ?location ?city ?zipcode 
    WHERE {
        ?person ex:worksAt ?location . 
        ?location ex:located ?city . 
        ?location ex:zipcode ?zipcode
    }"#;

    let results = execute_query(sparql, &mut database);

    println!("Results:");
    for result in results {
        if let [person, location, city, zip] = &result[..] {
            println!(
                "?person = {}, ?location = {}, ?city = {}, ?zip = {}",
                person, location, city, zip
            );
        }
    }
}

fn main() {
  advanced_join();
}
```

---

### Single-Threaded Processing Example

This example reads a synthetic RDF file and processes it in a single thread.

```rust
use kolibrie::parser::*;
use kolibrie::sparql_database::SparqlDatabase;

fn simple_select_synth_data(file_path: &str) {
    let file = std::fs::read_to_string(file_path)
                                        .expect("Error of finding file");
    let mut database = SparqlDatabase::new();

    database.parse_rdf(&file);

    let sparql = r#"
    PREFIX ds: <https://data.cityofchicago.org/resource/xzkq-xp2w/>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    SELECT ?employee ?workplaceHomepage ?salary
    WHERE {
        ?employee foaf:workplaceHomepage ?workplaceHomepage .
        ?employee ds:annual_salary ?salary
    }"#;

    let results = execute_query(sparql, &mut database);

    println!("Results:");
    for result in results {
        if let [employee, workplace_homepage, salary] = &result[..] {
            println!("?employee = {} ?workplaceHomepage = {} ?salary = {}", employee, workplace_homepage, salary);
        }
    }
}

fn main() {
    std::env::set_current_dir(std::path::Path::new(env!("CARGO_MANIFEST_DIR")))
        .expect("Failed to set project root as current directory");
    let file_path = "datasets/synthetic_data_employee_100K.rdf";
    simple_select_synth_data(file_path);
}
```

---

### Multi-Threaded Processing Example

This example uses multi-threading to process a synthetic RDF file.

```rust
use kolibrie::parser::*;
use kolibrie::sparql_database::SparqlDatabase;

fn simple_select_synth_data(file_path: &str) {
    let mut database = SparqlDatabase::new();

    // Call `parse_rdf_from_file` for multi-threaded processing
    database.parse_rdf_from_file(file_path);

    let sparql = r#"
    PREFIX ds: <https://data.cityofchicago.org/resource/xzkq-xp2w/> 
    PREFIX foaf: <http://xmlns.com/foaf/0.1/> 
    SELECT ?employee ?workplaceHomepage ?salary 
    WHERE {
        ?employee foaf:workplaceHomepage ?workplaceHomepage . 
        ?employee ds:annual_salary ?salary
    }"#;

    let results = execute_query(sparql, &mut database);

    println!("Results:");
    for result in results {
        if let [employee, workplace_homepage, salary] = &result[..] {
            println!("?employee = {} ?workplaceHomepage = {} ?salary = {}", employee, workplace_homepage, salary);
        }
    }
}

fn main() {
    std::env::set_current_dir(std::path::Path::new(env!("CARGO_MANIFEST_DIR")))
        .expect("Failed to set project root as current directory");
    let file_path = "../datasets/synthetic_data_employee_100K.rdf";
    simple_select_synth_data(&file_path);
}
```

---

### CUDA-Enabled Processing Example

This example demonstrates GPU acceleration using CUDA. (Note: Adjust your build settings and environment variables as required.)

For unix:

```export LD_LIBRARY_PATH=<path>:$LD_LIBRARY_PATH```

```cmake .```

```cmake --build .```

For Windows:
> Developer Command Prompt for VS 2022 for building cmake

```cmake -G "NMake Makefiles" -DCMAKE_BUILD_TYPE=Release .```

```cmake --build .```

```rust
use kolibrie::parser::*;
use kolibrie::sparql_database::SparqlDatabase;
use shared::GPU_MODE_ENABLED;

fn simple_select_synth_data(file_path: &str) {
    let mut database = SparqlDatabase::new();

    // Use multi-threaded parsing with CUDA acceleration enabled
    database.parse_rdf_from_file(file_path);

    let sparql = r#"
    PREFIX ds: <https://data.cityofchicago.org/resource/xzkq-xp2w/> 
    PREFIX foaf: <http://xmlns.com/foaf/0.1/> 
    SELECT ?employee ?workplaceHomepage ?salary 
    WHERE {
        ?employee foaf:workplaceHomepage ?workplaceHomepage . 
        ?employee ds:annual_salary ?salary
    }"#;

    let results = execute_query(sparql, &mut database);

    println!("Results:");
    for result in results {
        if let [employee, workplace_homepage, salary] = &result[..] {
            println!("?employee = {} ?workplaceHomepage = {} ?salary = {}", employee, workplace_homepage, salary);
        }
    }
}

#[gpu::main]
fn main() {
    std::env::set_current_dir(std::path::Path::new(env!("CARGO_MANIFEST_DIR")))
        .expect("Failed to set project root as current directory");
    let file_path = "../datasets/synthetic_data_employee_4.rdf";
    simple_select_synth_data(&file_path);
}
```