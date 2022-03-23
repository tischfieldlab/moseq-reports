# About Moseq Reports
Interactive interrogation of Moseq models.

## Purpose
In short, moseq reports exists to democratize moseq data. Computational biologists often produce data which is difficult to parse without the proper context making it difficult for others to simply pick up and use. Moseq reports allows wetlab researchers to easily understand moseq models without having to reference outside sources. This program reports data in a form which can be quickly understood by researchers while also providing a set of robust tools to reformat that data in such a way that would be most beneficial to their research.
## Concepts
### What is moseq
Moseq is short for motion sequencing. Using a depth camera, mice are recorded freely behaving in an arena. These videos are analyzed and labeled for specific syllables using machine learning.

### What is a syllable
A syllable is a way in which a mouse poses its body in order to communicate something. Along with syllables, there is a grammar which dictates the way in which these syllables are put together.

### msq Files
MSQ Files are the format from which the moseq-reports program reads data including clips, IDs, and values. Think of it as a word document which requires the Microsoft Word program to access. Should you want to access the data stored in the msq file directly, you can change the extension from .msq to .zip and open it using a file archiver such as 7-Zip. For specific information on MSQ files, refrenced the [Developer Guide](DeveloperGuide.md#msq-files).

## Version Details

{{ $var.commitRef}}

{{ $var.commitHash}}
