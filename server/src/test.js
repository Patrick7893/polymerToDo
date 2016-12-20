var promise = new Promise((resolve, reject) => {
  setTimeout(() => resolve("Artem"), 1000);
})


async function wait() {
  var result = await promise;
  console.log(result);
  return;
}

wait();
