const page = {}

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
			return this.showError(`No file submitted for ${dstName}`);
		}
			
		if (!file.name.toLowerCase().endsWith(extension)) {
			return this.showError(`File ${file.name} should have file extension ${extension}`);
		}
			
		const fileSize = file.size / 1000000;
		if (fileSize > sizeLimit) {
			return this.showError(`File ${file.name} is greater than size limit of ${sizeLimit}MB`);
		}

		const data = await readFile(file);
		dir.file(dstName + extension, data);
	}

	async addCoverPage(dir) {
		const fields = [ "candidate-id", "solution-title", "project-notes", "word-count" ];
		const response = await window.fetch("template.html");
		let coverPage = await response.text()
		
		for (let fieldName of fields) {
			const value = document.getElementById(fieldName).value.trim();		
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
			const candidateId = document.getElementById("candidate-id").value.trim()
			page.result.download = `${candidateId}.zip`
			page.result.href = window.URL.createObjectURL(result)
			page.result.click()
		}
	}
}

async function submitSolution() {
	page.submitButton.classList.add("hidden")
	page.pleaseWait.classList.remove("hidden")
	await new Submission().build();
	page.submitButton.classList.remove("hidden")
	page.pleaseWait.classList.add("hidden")
}

window.addEventListener("load", event => {
	page.submitButton = document.getElementById("submit-button")
	page.pleaseWait = document.getElementById("please-wait")
	page.result = document.getElementById("result")
})
