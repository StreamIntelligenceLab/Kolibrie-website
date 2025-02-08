# Knowledge Graph Management

## Table of Contents

1. [Introduction](#introduction)
2. [ABox and TBox](#abox-and-tbox)
    - [ABox (Assertional Box)](#abox-assertional-box)
    - [TBox (Terminological Box)](#tbox-terminological-box)
3. [Triple Patterns and Terms](#triple-patterns-and-terms)
4. [Rule-Based Inference](#rule-based-inference)
5. [Overview of the Knowledge Graph](#overview-of-the-knowledge-graph)
6. [Core Functionalities](#core-functionalities)
    - [Adding Triples](#adding-triples)
    - [Querying the Graph](#querying-the-graph)
    - [Rule Management and Inference](#rule-management-and-inference)
7. [Backward Chaining](#backward-chaining)
8. [Example Usage](#example-usage)
    - [Knowledge Graph Inference Example](#knowledge-graph-inference-example)
9. [Appendices](#appendices)
    - [Glossary](#glossary)
    - [Further Reading](#further-reading)

---

## Introduction

The Knowledge Graph module provides a flexible and powerful way to represent and reason about information in the form of triples. By supporting both instance-level data (ABox) and schema-level information (TBox), the module allows you to build rich knowledge representations and perform inference based on dynamic rules.

## ABox and TBox

### ABox (Assertional Box)

The ABox contains assertions about individual entities. These assertions represent concrete facts—for example, stating that "Alice is a Person" or "Bob is the parent of Charlie."

### TBox (Terminological Box)

The TBox defines the schema or ontology of your data. It includes definitions of concepts and relationships (such as class hierarchies) that provide context for the instance data in the ABox.

## Triple Patterns and Terms

The system represents information as triples (subject, predicate, object). For querying and rule specification, triple patterns are used. These patterns use a general notion of terms—where some elements are fixed (constants) and others are placeholders (variables) that can be bound during query execution.

## Rule-Based Inference

Rule-based inference enables the derivation of new information from existing data. A rule typically consists of one or more premise patterns and a conclusion pattern. When the premises are matched against the data, the corresponding conclusion is inferred and can be added to the graph.

## Overview of the Knowledge Graph

At a high level, the Knowledge Graph module encapsulates:
- **ABox:** The set of instance-level facts.
- **TBox:** The schema or ontology information.
- **Rules:** Dynamic rules used to infer additional facts.
- **A Dictionary:** An internal mapping mechanism to efficiently manage and encode terms.

All internal relationships among these components are hidden from the user, providing a simple and intuitive interface for managing your knowledge.

## Core Functionalities

### Adding Triples

The module allows you to add triples to both the TBox (for schema information) and the ABox (for instance data). For example, you might add a triple to specify that "Person" is a subclass of "Agent" or assert that "Alice" is a "Person."

```rust
let mut kg = KnowledgeGraph::new();
kg.add_tbox_triple("Person", "rdfs:subClassOf", "Agent");
kg.add_abox_triple("Alice", "rdf:type", "Person");
```

### Querying the Graph

You can query both the ABox and TBox by specifying optional criteria (subject, predicate, object). This allows you to retrieve facts that match a particular pattern.

```rust
let results = kg.query_abox(Some("Alice"), Some("rdf:type"), None);
```

### Rule Management and Inference

Dynamic rules can be added to the Knowledge Graph. Once added, the system can infer new facts based on the rules and existing assertions.

```rust
let rule = Rule {
    premise: vec![
        (
            Term::Variable("x".to_string()),
            Term::Constant(kg.dictionary.encode("rdf:type")),
            Term::Constant(kg.dictionary.encode("Person")),
        ),
    ],
    conclusion: (
        Term::Variable("x".to_string()),
        Term::Constant(kg.dictionary.encode("isHuman")),
        Term::Constant(kg.dictionary.encode("true")),
    ),
};
kg.add_rule(rule);
```

After adding rules, you can run the inference process to derive new facts.

```rust
let inferred_facts = kg.infer_new_facts();
```

## Backward Chaining

Backward chaining is a reasoning method where the system starts from a query goal and works backward to determine if the goal can be satisfied by existing data and rules. The interface provides a function that returns possible variable bindings if a query pattern can be matched using backward reasoning.

```rust
let query = (
    Term::Variable("X".to_string()),
    Term::Constant(kg.dictionary.encode("ancestor")),
    Term::Constant(kg.dictionary.encode("David")),
);
let results = kg.backward_chaining(&query);
```

## Example Usage

Below are some practical examples that demonstrate how to use the Knowledge Graph module. The examples illustrate adding triples, defining rules, running inference, and querying the graph.

### Knowledge Graph Inference Example

**Scenario:** Infer that all individuals of type `Person` have the property `isHuman` set to `true`.

#### Step 1: Initialize the Knowledge Graph

```rust
use crate::knowledge_graph::{KnowledgeGraph, Rule, Term};

let mut kg = KnowledgeGraph::new();

// Add schema (TBox) triples
kg.add_tbox_triple("Person", "rdfs:subClassOf", "Agent");

// Add instance (ABox) triples
kg.add_abox_triple("Alice", "rdf:type", "Person");
kg.add_abox_triple("Bob", "rdf:type", "Person");
kg.add_abox_triple("Charlie", "rdf:type", "Agent");
```

#### Step 2: Define and Add a Rule

```rust
// Define a rule: If x is a Person, then x isHuman true
let rule = Rule {
    premise: vec![
        (
            Term::Variable("x".to_string()),
            Term::Constant(kg.dictionary.encode("rdf:type")),
            Term::Constant(kg.dictionary.encode("Person")),
        ),
    ],
    conclusion: (
        Term::Variable("x".to_string()),
        Term::Constant(kg.dictionary.encode("isHuman")),
        Term::Constant(kg.dictionary.encode("true")),
    ),
};
kg.add_rule(rule);
```

#### Step 3: Perform Inference

```rust
let inferred_facts = kg.infer_new_facts();

for fact in inferred_facts {
    println!(
        "Inferred Triple -> Subject: {}, Predicate: {}, Object: {}",
        kg.dictionary.decode(fact.subject).unwrap(),
        kg.dictionary.decode(fact.predicate).unwrap(),
        kg.dictionary.decode(fact.object).unwrap()
    );
}
```

**Expected Output:**

```
Inferred Triple -> Subject: Alice, Predicate: isHuman, Object: true
Inferred Triple -> Subject: Bob, Predicate: isHuman, Object: true
```

In this example, the rule detects that "Alice" and "Bob" are of type "Person" and infers that they possess the property `isHuman` with the value `true`. No inference is made for "Charlie" since "Charlie" is not of type "Person."

## Appendices

### Glossary

- **RDF (Resource Description Framework):** A standard model for data interchange, where information is represented as triples.
- **SPARQL:** A query language for RDF that allows the extraction of complex information.
- **ABox (Assertional Box):** Contains factual assertions about individual entities.
- **TBox (Terminological Box):** Contains schema-level definitions and relationships.
- **Triple Pattern:** A template with variables and constants used to match triples.
- **Rule-Based Inference:** The process of deriving new information based on predefined rules.
- **Backward Chaining:** A reasoning approach that starts with a goal and works backward to validate it.

### Further Reading

- [SPARQL Query Language for RDF](https://www.w3.org/TR/sparql11-query/)
- [Description Logics Primer](https://www.cs.ox.ac.uk/activities/logic/)

---

## Example Code

Below are some representative code examples. They demonstrate how to use the module to add data, define rules, perform inference, and query results.

### Datalog Example

```rust
use datalog::knowledge_graph::KnowledgeGraph;
use shared::terms::Term;
use shared::rule::Rule;

fn main() {
    let mut kg = KnowledgeGraph::new();

    kg.add_abox_triple("Alice", "parent", "Bob");
    kg.add_abox_triple("Bob", "parent", "Charlie");
    kg.add_abox_triple("Charlie", "parent", "David");

    let rule1 = Rule {
        premise: vec![
            (Term::Variable("X".to_string()), 
             Term::Constant(kg.dictionary.encode("parent")), 
             Term::Variable("Y".to_string())),
        ],
        conclusion: (Term::Variable("X".to_string()), 
                     Term::Constant(kg.dictionary.encode("ancestor")), 
                     Term::Variable("Y".to_string())),
        filters: vec![],
    };
    
    let rule2 = Rule {
        premise: vec![
            (Term::Variable("X".to_string()), 
             Term::Constant(kg.dictionary.encode("parent")), 
             Term::Variable("Y".to_string())),
            (Term::Variable("Y".to_string()), 
             Term::Constant(kg.dictionary.encode("ancestor")), 
             Term::Variable("Z".to_string())),
        ],
        conclusion: (Term::Variable("X".to_string()), 
                     Term::Constant(kg.dictionary.encode("ancestor")), 
                     Term::Variable("Z".to_string())),
        filters: vec![],
    };
    
    kg.add_rule(rule1);
    kg.add_rule(rule2);

    let inferred_facts = kg.infer_new_facts_semi_naive();
    for fact in inferred_facts {
        println!("{:?}", kg.dictionary.decode_triple(&fact));
    }
    let query = (
        Term::Variable("X".to_string()), 
        Term::Constant(kg.dictionary.encode("ancestor")), 
        Term::Constant(kg.dictionary.encode("David")),
    );
    
    let results = kg.datalog_query_kg(&query);
    
    for result in results {
        println!("Ancestor: {:?}", kg.dictionary.decode(*result.get("X").unwrap()));
    }
}
```

### Knowledge Graph Example

```rust
use shared::dictionary::Dictionary;
use shared::terms::Term;
use shared::rule::Rule;
use datalog::knowledge_graph::*;
use datalog::parser_n3_logic::parse_n3_rule;

fn knowledge_graph() {
    let mut graph = KnowledgeGraph::new();

    // Add instance-level (ABox) triples
    graph.add_abox_triple("Alice", "hasParent", "Bob");
    graph.add_abox_triple("Bob", "hasParent", "Charlie");

    // Define a rule: If X hasParent Y and Y hasParent Z, then X hasGrandparent Z
    let grandparent_rule = Rule {
        premise: vec![
            (
                Term::Variable("X".to_string()),
                Term::Constant(graph.dictionary.encode("hasParent")),
                Term::Variable("Y".to_string()),
            ),
            (
                Term::Variable("Y".to_string()),
                Term::Constant(graph.dictionary.encode("hasParent")),
                Term::Variable("Z".to_string()),
            ),
        ],
        conclusion: (
            Term::Variable("X".to_string()),
            Term::Constant(graph.dictionary.encode("hasGrandparent")),
            Term::Variable("Z".to_string()),
        ),
        filters: vec![],
    };

    graph.add_rule(grandparent_rule);

    let inferred_facts = graph.infer_new_facts();

    for triple in inferred_facts {
        println!(
            "{} -- {} -- {}",
            graph.dictionary.decode(triple.subject).unwrap(),
            graph.dictionary.decode(triple.predicate).unwrap(),
            graph.dictionary.decode(triple.object).unwrap()
        );
    }
}

fn backward_chaining() {
    let mut dict = Dictionary::new();

    let parent = dict.encode("parent");
    let ancestor = dict.encode("ancestor");
    let charlie = dict.encode("Charlie");

    let mut kg = KnowledgeGraph::new();

    // Add facts (ABox)
    kg.add_abox_triple("Alice", "parent", "Bob");
    kg.add_abox_triple("Bob", "parent", "Charlie");

    // Define rules for inference
    let rule1 = Rule {
        // ancestor(X, Y) :- parent(X, Y)
        premise: vec![(
            Term::Variable("X".to_string()),
            Term::Constant(parent),
            Term::Variable("Y".to_string()),
        )],
        conclusion: (
            Term::Variable("X".to_string()),
            Term::Constant(ancestor),
            Term::Variable("Y".to_string()),
        ),
        filters: vec![],
    };

    let rule2 = Rule {
        // ancestor(X, Z) :- parent(X, Y), ancestor(Y, Z)
        premise: vec![
            (
                Term::Variable("X".to_string()),
                Term::Constant(parent),
                Term::Variable("Y".to_string()),
            ),
            (
                Term::Variable("Y".to_string()),
                Term::Constant(ancestor),
                Term::Variable("Z".to_string()),
            ),
        ],
        conclusion: (
            Term::Variable("X".to_string()),
            Term::Constant(ancestor),
            Term::Variable("Z".to_string()),
        ),
        filters: vec![],
    };

    kg.add_rule(rule1);
    kg.add_rule(rule2);

    let query = (
        Term::Variable("A".to_string()),
        Term::Constant(ancestor),
        Term::Constant(charlie),
    );

    let results = kg.backward_chaining(&query);

    for res in results {
        if let Some(ancestor_term) = res.get("A") {
            if let Term::Constant(ancestor_id) = resolve_term(ancestor_term, &res) {
                if let Some(ancestor_name) = dict.decode(ancestor_id) {
                    println!("Ancestor: {}", ancestor_name);
                }
            }
        }
    }
}

fn test() {
    let input = "@prefix test: <http://www.test.be/test#>.\n@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.\n{ ?s rdf:type test:SubClass. } => { ?s rdf:type test:SuperType. }";

    let mut graph = KnowledgeGraph::new();

    graph.add_abox_triple(
        "http://example2.com/a",
        "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
        "http://www.test.be/test#SubClass",
    );

    match parse_n3_rule(input, &mut graph) {
        Ok((_, (prefixes, rule))) => {
            println!("Parsed Prefixes:");
            for (prefix, uri) in prefixes {
                println!("{}: <{}>", prefix, uri);
            }

            println!("\nParsed Rule:");
            println!("{:?}", rule);

            graph.add_rule(rule);

            let old_facts = graph.index_manager.query(None, None, None);

            let inferred_facts = graph.infer_new_facts();

            println!("\nOriginal and Inferred Facts:");
            for triple in old_facts.iter().chain(inferred_facts.iter()) {
                let s = graph.dictionary.decode(triple.subject).unwrap();
                let p = graph.dictionary.decode(triple.predicate).unwrap();
                let o = graph.dictionary.decode(triple.object).unwrap();
                println!("<{}> -- <{}> -- <{}> .", s, p, o);
            }
        }
        Err(error) => eprintln!("Failed to parse rule: {:?}", error),
    }
}

fn test2() {
    let mut kg = KnowledgeGraph::new();

    let n3_rule = r#"@prefix ex: <http://example.org/family#>.
{ ?x ex:hasParent ?y. ?y ex:hasSibling ?z. } => { ?x ex:hasUncleOrAunt ?z. }."#;

    kg.add_abox_triple("John", "ex:hasParent", "Mary");
    kg.add_abox_triple("Mary", "ex:hasSibling", "Robert");

    match parse_n3_rule(&n3_rule, &mut kg) {
        Ok((_, (prefixes, rule))) => {
            println!("Parsed Prefixes:");
            for (prefix, uri) in prefixes {
                println!("{}: <{}>", prefix, uri);
            }

            println!("\nParsed Rule:");
            println!("{:?}", rule);

            kg.add_rule(rule);

            let old_facts = kg.index_manager.query(None, None, None);

            let inferred_facts = kg.infer_new_facts();

            println!("\nOriginal and Inferred Facts:");
            for triple in old_facts.iter().chain(inferred_facts.iter()) {
                let s = kg.dictionary.decode(triple.subject).unwrap();
                let p = kg.dictionary.decode(triple.predicate).unwrap();
                let o = kg.dictionary.decode(triple.object).unwrap();
                println!("<{}> <{}> <{}>.", s, p, o);
            }
        }
        Err(error) => eprintln!("Failed to parse rule: {:?}", error),
    }
}

fn main() {
    knowledge_graph();
    println!("=======================================");
    backward_chaining();
    println!("=======================================");
    test();
    println!("=======================================");
    test2();
}
```