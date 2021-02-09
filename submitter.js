async function readFile(file) {
	const reader = new FileReader();
	const promise = new Promise((resolve, reject) => {
		reader.onload = data => {
			resolve(data.target.result);
		};
	});
	reader.readAsArrayBuffer(file);
	return promise;
}

class Submission {
	constructor() {
		this.hasError = false;
		this.zip = new JSZip();
	}

	clearError() {
		this.hasError = false;
		document.getElementById("error-message").innerText = "";
	}

	showError(message) {
		if (!this.hasError) {
			this.hasError = true;
			document.getElementById("error-message").innerText = message;
		}
	}

	async addDocumentation(dir, srcName, dstName, extension, sizeLimit) {
		const file = document.getElementById(srcName).files[0];
		if (!file) {
			return this.showError("No file submitted for " + dstName);
		}
			
		if (!file.name.toLowerCase().endsWith(extension)) {
			return this.showError("File " + file.name + " should have file extension " + extension);
		}
			
		const fileSize = file.size / 1000000;
		if (fileSize > sizeLimit) {
			return this.showError("File " + file.name + " is greater than size limit of " + sizeLimit + " megabytes");
		}

		const data = await readFile(file);
		dir.file(dstName + extension, data);
	}

	async addCoverPage(dir) {
		const fields = [ "candidate-name", "school-number", "session-number", "solution-title", "user-name", "word-count" ];
		let coverPage = document.getElementById("template").innerText;
		coverPage = atob(coverPage);
		
		for (let fieldName of fields) {
			const value = document.getElementById(fieldName).value.trim();
			
			if (value.length === 0) this.showError("You need to enter a value for " + fieldName);
			coverPage = coverPage.replace("${" + fieldName + "}", value)
		}
		
		this.zip.file("cover-page.html", coverPage);
	}

	async build() {
		this.clearError();
		
		const prd_dir = this.zip.folder("product");
		const doc_dir = this.zip.folder("documentation");
		
		await this.addCoverPage(this.zip);
		await this.addDocumentation(doc_dir, "file1", "criterion-a-planning", ".pdf", 10);
		await this.addDocumentation(doc_dir, "file2", "criterion-b-rot", ".pdf", 20);
		await this.addDocumentation(doc_dir, "file3", "criterion-b-design", ".pdf", 50);
		await this.addDocumentation(doc_dir, "file4", "criterion-c-development", ".pdf", 50);
		await this.addDocumentation(doc_dir, "file5", "criterion-d-video", ".mp4", 300);
		await this.addDocumentation(doc_dir, "file6", "criterion-e-evaluation", ".pdf", 20);
		await this.addDocumentation(doc_dir, "file7", "appendix", ".pdf", 50);
		await this.addDocumentation(prd_dir, "file8", "product", ".zip", 200);
		
		if (!this.hasError) {
			const result = await this.zip.generateAsync({ type: "blob" });
			window.location = window.URL.createObjectURL(result);	
		}
	}
}

async function submitSolution() {
	document.getElementById("submit-button").disabled = true;
	await new Submission().build();
	document.getElementById("submit-button").disabled = false;	
}

window.onload = event => {

};
