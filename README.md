# IFC Format Specification

The IFC specification aims to formally define a binary format for describing the _semantics_ of C++ programs (or program fragments) 
 at a high level of abstraction, before lowering to machine code or similar.

This format is designed to offer a persistent form of the in-memory [Internal Program Representation (IPR) of C++ programs](https://github.com/GabrielDosReis/ipr) originally developed by Gabriel Dos Reis and Bjarne Stroustrup.  As such, it follows the same principles as the IPR:
   - **Completeness**: Represents the semantics of all Standard C++ constructs
   - **Generality**: Suitable for every kind of application, rather than targeted to a particular application area
   - **Regularity**: Does not mimic C++ language irregularities; general rules are used, rather than long lists of special cases
   - **Typefulness**: Every expression has a type
   - **Minimality**: No redundant values, and traversal involves no redundant indirections
   - **Compiler neutrality**: Not tied to a particular compiler
   - **Scalability**: Able to represent hundreds of thousands of lines of codes on common machines


## Contribute

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Building
In order to build the PDF rendering of the specification, ensure that you have a modern LaTeX processor installed.

Clone a copy of the repo
```
git clone https://github.com/microsoft/ifc-spec.git
```

Change to the LaTeX directory
```
cd ltx
```
Issue the command
```
pdflatex ifc
```
followed by
```
bibtex ifc
```
and possibly two more times
```
pdflatex ifc
```

