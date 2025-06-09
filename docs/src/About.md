<script setup>
import { data } from './../.vitepress/theme/release.data'
</script>

# About Moseq Reports
Interactive interrogation of Moseq models.

## Purpose
In short, moseq reports exists to democratize moseq data. Computational biologists often produce data which is difficult to parse without the proper tools or context making, increasing barriers to access for others to simply pick up and use. Moseq reports allows wet-lab researchers to easily understand moseq models without having to reference outside sources or learn programming languages and manage complex software environments. This program reports data in a form which can be quickly understood by researchers while also providing a set of robust tools to reformat that data in such a way that would be most beneficial to their research.

## Concepts

### What is moseq
Moseq is short for motion sequencing. Using a depth camera, mice are recorded freely behaving in an arena. These videos are analyzed and labeled for specific syllables using machine learning. Moseq was first described in [`Wiltschko et al. 2015. DOI: 10.1016/j.neuron.2015.11.031`](https://doi.org/10.1016/j.neuron.2015.11.031), but many papers utilizing this technology have since been published.

### What is a syllable
A syllable is a stereotyped, reusable, action performed by an animal. Syllables are concatenated in time (through transitions) to build up larger and more complex behaviors. Syllables are described by a linear dynamical system using 3D pose information (like that provided by a depth camera)  Along with syllables, there is a grammar which dictates the way in which these syllables are put together (transitions).

### `*.msq` Files
MSQ Files are the format from which the moseq-reports program reads data including video clips, usage data, transitions data, and other data. Think of it as a word document which requires the Microsoft Word program to access. Should you want to access the data stored in the msq file directly, you can change the extension from `.msq` to `.zip` and open it using a file archiver such as 7-Zip. For specific information on MSQ files, referenced the [Developer Guide](dev_guide/MSQInternals.md).

## Version Details
|Identifier|Value|
|:--|:--|
|App Version|{{ data.appVersion }}|
|Branch/Tag|{{ data.commitRef }}|
|Commit Hash|{{ data.commitHash }}|
